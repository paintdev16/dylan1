<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\CashRegisterSession;
use App\Models\Payment;
use App\Models\RestaurantTable;
use App\Models\TableSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            $cashTotal = $payments->where('payment_method', 'efectivo')->sum('amount');
            $cardTotal = $payments->where('payment_method', 'tarjeta')->sum('amount');
            $digitalTotal = $payments->whereIn('payment_method', ['yape', 'plin'])->sum('amount');
            $totalCollected = $payments->sum('amount');
            $expectedCash = (float) $activeSession->opening_amount + (float) $cashTotal;

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

        return inertia('cash-register/index', compact(
            'activeSession',
            'summary',
            'pendingBills',
            'pastSessions'
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
            'payment_method' => ['required', 'in:efectivo,tarjeta,yape,plin'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'received_amount' => ['nullable', 'numeric', 'min:0'],
            'receipt_number' => ['nullable', 'string', 'max:50'],
        ]);

        return DB::transaction(function () use ($bill, $validated, $request, $activeSession) {
            $lockedBill = Bill::where('id', $bill->id)->lockForUpdate()->firstOrFail();

            if ($lockedBill->status !== 'open') {
                return back()->withErrors([
                    'bill' => 'Esta cuenta ya está cerrada y pagada.',
                ]);
            }

            if ($validated['amount'] > ($lockedBill->balance + 0.01)) {
                return back()->withErrors([
                    'amount' => 'El importe ingresado excede el saldo pendiente (S/. '.number_format($lockedBill->balance, 2).').',
                ]);
            }

            $receiptNum = ($validated['receipt_number'] ?? null) ?: ('B001-'.str_pad((string) $lockedBill->id, 6, '0', STR_PAD_LEFT));

            Payment::create([
                'cash_register_session_id' => $activeSession->id,
                'bill_id' => $lockedBill->id,
                'cashier_id' => $request->user()->id,
                'payment_method' => $validated['payment_method'],
                'amount' => $validated['amount'],
                'receipt_number' => $receiptNum,
            ]);

            // Comprobar si la cuenta quedó totalmente saldada
            if ($lockedBill->fresh()->balance <= 0.01) {
                // 1. Cerrar cuenta
                $lockedBill->update([
                    'status' => 'closed',
                    'closed_at' => now(),
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
                    ->where('status', '!=', 'completado')
                    ->update(['status' => 'completado']);
            }

            $change = null;
            if ($validated['payment_method'] === 'efectivo' && ! empty($validated['received_amount'] ?? null)) {
                $change = max(0, (float) $validated['received_amount'] - (float) $validated['amount']);
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
            ->where('payment_method', 'efectivo')
            ->sum('amount');

        $expectedAmount = (float) $session->opening_amount + (float) $cashCollected;
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
