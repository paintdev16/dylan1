<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\CancellationRequest;
use App\Models\CashRegisterMovement;
use App\Models\CashRegisterSession;
use App\Models\Payment;
use App\Models\RestaurantTable;
use App\Models\TableSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Response;

class CashRegisterController extends Controller
{
    public function index(Request $request): Response
    {
        $activeSession = CashRegisterSession::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->first();

        $summary = null;

        if ($activeSession) {
            $payments = $activeSession->payments()->get();
            $cashTotal = $payments->where('payment_method', 'cash')->sum('amount');
            $cardTotal = $payments->where('payment_method', 'card')->sum('amount');
            $digitalTotal = $payments->whereIn('payment_method', ['yape', 'plin'])->sum('amount');
            $totalCollected = $payments->sum('amount');
            $movementBalance = (float) $activeSession->movements()
                ->selectRaw("COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS balance")
                ->value('balance');
            $expectedCash = (float) $activeSession->opening_amount + (float) $cashTotal + $movementBalance;

            $summary = [
                'cash_total' => (float) $cashTotal,
                'card_total' => (float) $cardTotal,
                'digital_total' => (float) $digitalTotal,
                'total_collected' => (float) $totalCollected,
                'expected_cash' => (float) $expectedCash,
                'transactions_count' => $payments->count(),
            ];
        }

        $pendingBills = Bill::where('status', 'open')
            ->with([
                'restaurantTable',
                'openingWaiter',
                'orders.items.product',
                'orders.items.menuModality',
                'orders.items.dailyMenuProducts.product',
                'payments',
            ])
            ->orderBy('opened_at', 'asc')
            ->get();

        $pastSessions = CashRegisterSession::where('user_id', $request->user()->id)
            ->where('status', 'closed')
            ->orderByDesc('closed_at')
            ->limit(5)
            ->get();

        $cancellationRequests = CancellationRequest::query()
            ->where('status', 'pending')
            ->with([
                'requester:id,name',
                'orderItem.order.bill.restaurantTable',
                'orderItem.product:id,name',
                'orderItem.menuModality:id,name',
            ])
            ->latest()
            ->get();

        return inertia('cash-register/index', compact(
            'activeSession',
            'summary',
            'pendingBills',
            'pastSessions',
            'cancellationRequests'
        ));
    }

    public function openSession(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'opening_amount' => ['required', 'numeric', 'min:0'],
        ]);

        $existingOpen = CashRegisterSession::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->exists();

        if ($existingOpen) {
            return back()->withErrors([
                'session' => 'Ya tienes una sesión de caja abierta.',
            ]);
        }

        CashRegisterSession::create([
            'user_id' => $request->user()->id,
            'opening_amount' => $validated['opening_amount'],
            'status' => 'open',
            'opened_at' => now(),
        ]);

        return redirect()
            ->route('cash-register.index')
            ->with('success', 'Caja aperturada correctamente con fondo de S/. '.number_format($validated['opening_amount'], 2));
    }

    public function storePayment(Request $request, Bill $bill): RedirectResponse
    {
        $activeSession = CashRegisterSession::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->first();

        if (! $activeSession) {
            return back()->withErrors([
                'session' => 'Debes tener una sesión de caja abierta para registrar pagos.',
            ]);
        }

        $validated = $request->validate([
            'payment_method' => ['required_without:payments', 'nullable', 'in:cash,card,yape,plin'],
            'amount' => ['required_without:payments', 'nullable', 'numeric', 'min:0.01'],
            'received_amount' => ['nullable', 'numeric', 'min:0'],
            'receipt_number' => ['nullable', 'string', 'max:50'],
            'operation_code' => ['nullable', 'string', 'max:100'],
            'receipt_type' => ['nullable', 'in:ticket,receipt,invoice'],
            'customer_name' => [Rule::requiredIf($request->receipt_type === 'invoice'), 'nullable', 'string', 'max:150'],
            'customer_document' => [Rule::requiredIf($request->receipt_type === 'invoice'), 'nullable', 'string', 'max:20'],
            'payments' => ['nullable', 'array', 'min:2'],
            'payments.*.payment_method' => ['required_with:payments', 'distinct', 'in:cash,card,yape,plin'],
            'payments.*.amount' => ['required_with:payments', 'numeric', 'min:0.01'],
            'payments.*.operation_code' => ['nullable', 'string', 'max:100'],
        ]);

        return DB::transaction(function () use ($bill, $validated, $request, $activeSession) {
            $lockedBill = Bill::where('id', $bill->id)->lockForUpdate()->firstOrFail();

            if ($lockedBill->status !== 'open') {
                return back()->withErrors([
                    'bill' => 'Esta cuenta ya está cerrada y pagada.',
                ]);
            }

            $paymentParts = $validated['payments'] ?? [[
                'payment_method' => $validated['payment_method'],
                'amount' => $validated['amount'],
                'operation_code' => $validated['operation_code'] ?? null,
            ]];
            $paymentTotal = 0.0;
            foreach ($paymentParts as $paymentPart) {
                $paymentTotal += (float) $paymentPart['amount'];
            }

            if ($paymentTotal > ($lockedBill->balance + 0.01)) {
                return back()->withErrors([
                    'amount' => 'El importe ingresado excede el saldo pendiente (S/. '.number_format($lockedBill->balance, 2).').',
                ]);
            }

            foreach ($paymentParts as $paymentPart) {
                if (
                    $paymentPart['payment_method'] === 'cash'
                    && isset($validated['received_amount'])
                    && (float) $validated['received_amount'] < (float) $paymentPart['amount']
                ) {
                    return back()->withErrors([
                        'received_amount' => 'El efectivo recibido no puede ser menor que el importe cobrado.',
                    ]);
                }
            }

            $receiptNum = ($validated['receipt_number'] ?? null) ?: sprintf(
                'B001-%06d-%02d',
                $lockedBill->id,
                $lockedBill->payments()->count() + 1
            );

            $paymentGroupId = (string) Str::uuid();
            foreach ($paymentParts as $index => $part) {
                $receivedAmount = $part['payment_method'] === 'cash'
                    ? (float) ($validated['received_amount'] ?? $part['amount'])
                    : null;
                Payment::create([
                    'cash_register_session_id' => $activeSession->id,
                    'payment_group_id' => $paymentGroupId,
                    'bill_id' => $lockedBill->id,
                    'cashier_id' => $request->user()->id,
                    'payment_method' => $part['payment_method'],
                    'amount' => $part['amount'],
                    'received_amount' => $receivedAmount,
                    'change_amount' => $receivedAmount === null ? 0 : max(0, $receivedAmount - (float) $part['amount']),
                    'operation_code' => $part['operation_code'] ?? null,
                    'receipt_type' => $validated['receipt_type'] ?? 'ticket',
                    'receipt_number' => count($paymentParts) === 1 ? $receiptNum : $receiptNum.'-'.($index + 1),
                    'customer_name' => $validated['customer_name'] ?? null,
                    'customer_document' => $validated['customer_document'] ?? null,
                ]);
            }

            // Comprobar si la cuenta quedó totalmente saldada
            if ($lockedBill->fresh()->balance <= 0.01) {
                // 1. Cerrar cuenta
                $lockedBill->update([
                    'status' => 'closed',
                    'closed_at' => now(),
                    'closed_by' => $request->user()->id,
                    'sale_snapshot' => $this->createSaleSnapshot($lockedBill),
                ]);

                // 2. Cerrar sesión de mesa
                if ($lockedBill->table_session_id) {
                    TableSession::where('id', $lockedBill->table_session_id)
                        ->update([
                            'status' => 'closed',
                            'closed_at' => now(),
                        ]);
                }

                // 3. Liberar mesa a available
                if ($lockedBill->table_id) {
                    RestaurantTable::where('id', $lockedBill->table_id)
                        ->update(['status' => 'available']);
                }

                // 4. Marcar comandas como completadas
                $lockedBill->orders()
                    ->where('status', '!=', 'completed')
                    ->update(['status' => 'completed']);
            }

            $change = null;
            if (count($paymentParts) === 1 && $paymentParts[0]['payment_method'] === 'cash' && ! empty($validated['received_amount'] ?? null)) {
                $change = max(0, (float) $validated['received_amount'] - (float) $paymentParts[0]['amount']);
            }

            $successMsg = 'Pago registrado exitosamente.';
            if ($change !== null && $change > 0) {
                $successMsg .= ' Vuelto: S/. '.number_format($change, 2);
            }

            return redirect()
                ->route('cash-register.index')
                ->with('success', $successMsg);
        });
    }

    public function storeMovement(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:income,expense,withdrawal,petty_cash'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'description' => ['required', 'string', 'max:255'],
        ]);
        $session = CashRegisterSession::query()
            ->where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->first();

        if (! $session) {
            return back()->withErrors(['session' => 'Debes tener una caja abierta.']);
        }

        CashRegisterMovement::create($validated + [
            'cash_register_session_id' => $session->id,
            'user_id' => $request->user()->id,
        ]);

        return back()->with('success', 'Movimiento de caja registrado.');
    }

    /**
     * @return list<array{order_id: int, items: list<array{description: string, components: list<string>, quantity: int, unit_price: string, subtotal: string}>}>
     */
    private function createSaleSnapshot(Bill $bill): array
    {
        $bill->load([
            'orders.items.product',
            'orders.items.menuModality',
            'orders.items.dailyMenuProducts.product',
        ]);

        $snapshot = [];
        foreach ($bill->orders as $order) {
            $items = [];
            foreach ($order->items as $item) {
                if ($item->is_cancelled) {
                    continue;
                }

                $components = [];
                foreach ($item->dailyMenuProducts as $dailyMenuProduct) {
                    $components[] = $dailyMenuProduct->product->name;
                }

                $description = 'Ítem de consumo';
                if ($item->product !== null) {
                    $description = $item->product->name;
                } elseif ($item->menuModality !== null) {
                    $description = $item->menuModality->name;
                }

                $items[] = [
                    'description' => $description,
                    'components' => $components,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'subtotal' => $item->subtotal,
                ];
            }

            $snapshot[] = ['order_id' => $order->id, 'items' => $items];
        }

        return $snapshot;
    }

    public function closeSession(Request $request, CashRegisterSession $session): RedirectResponse
    {
        if ($session->user_id !== $request->user()->id || $session->status !== 'open') {
            return back()->withErrors([
                'session' => 'No puedes cerrar esta sesión de caja.',
            ]);
        }

        $validated = $request->validate([
            'closing_amount' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $cashCollected = $session->payments()
            ->where('payment_method', 'cash')
            ->sum('amount');

        $movementBalance = (float) $session->movements()
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS balance")
            ->value('balance');
        $expectedAmount = (float) $session->opening_amount + (float) $cashCollected + $movementBalance;
        $difference = (float) $validated['closing_amount'] - $expectedAmount;

        $session->update([
            'closing_amount' => $validated['closing_amount'],
            'expected_amount' => $expectedAmount,
            'difference' => $difference,
            'notes' => $validated['notes'] ?? null,
            'status' => 'closed',
            'closed_at' => now(),
        ]);

        $diffMsg = $difference >= 0 ? '+ S/. '.number_format($difference, 2) : '- S/. '.number_format(abs($difference), 2);

        return redirect()
            ->route('cash-register.index')
            ->with('success', 'Caja cerrada correctamente. Efectivo esperado: S/. '.number_format($expectedAmount, 2).', Contado: S/. '.number_format($validated['closing_amount'], 2).' (Diferencia: '.$diffMsg.').');
    }
}
