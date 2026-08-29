<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Payment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function store(Request $request, Bill $bill): RedirectResponse
    {
        if ($bill->status === 'closed') {
            return back()->withErrors([
                'bill' => 'No se pueden registrar pagos en una cuenta cerrada.',
            ]);
        }

        $balance = $bill->balance;

        if ($balance <= 0) {
            return back()->withErrors([
                'amount' => 'La cuenta ya no presenta saldo pendiente.',
            ]);
        }

        $validated = $request->validate([
            'payment_method' => ['required', 'in:cash,card,yape,plin'],
            'amount' => ['required', 'numeric', 'gt:0', 'max:'.$balance],
            'receipt_number' => ['nullable', 'string', 'max:255', 'unique:payments,receipt_number'],
        ], [
            'amount.max' => 'El monto no puede superar el saldo pendiente (S/. '.number_format($balance, 2).').',
            'amount.gt' => 'El monto debe ser mayor a 0.',
        ]);

        $isClosed = false;

        DB::transaction(function () use ($bill, $validated, $request, &$isClosed): void {
            Payment::create([
                'bill_id' => $bill->id,
                'cashier_id' => $request->user()->id,
                'payment_method' => $validated['payment_method'],
                'amount' => $validated['amount'],
                'receipt_number' => $validated['receipt_number'] ?? null,
            ]);

            // Refresh payments to recalculate balance
            $bill->unsetRelation('payments');

            if ($bill->balance <= 0) {
                $bill->update([
                    'status' => 'closed',
                    'closed_at' => now(),
                ]);

                $restaurantTable = $bill->restaurantTable;

                if (
                    $restaurantTable !== null
                    && $restaurantTable->status === 'occupied'
                ) {
                    $restaurantTable->update(['status' => 'available']);
                }

                $isClosed = true;
            }
        });

        $message = $isClosed
            ? 'Pago registrado correctamente. La cuenta ha sido completada y cerrada.'
            : 'Pago registrado correctamente.';

        return redirect()
            ->route('bills.index')
            ->with('success', $message);
    }
}
