<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\RestaurantTable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class BillController extends Controller
{
    public function index(): Response
    {
        $bills = Bill::query()
            ->with([
                'restaurantTable',
                'openingWaiter',
                'orders.user',
                'orders.items.product',
                'orders.items.menuModality',
                'payments.cashier',
            ])
            ->orderByDesc('opened_at')
            ->get();

        $restaurantTables = RestaurantTable::query()
            ->where('status', 'available')
            ->orderBy('number')
            ->get();

        return inertia('bills/index', compact('bills', 'restaurantTables'));
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'order_type' => ['required', 'in:dine_in,takeout'],
            'table_id' => [
                'nullable',
                'integer',
                'exists:restaurant_tables,id',
                'required_if:order_type,dine_in',
                'prohibited_if:order_type,takeout',
            ],
        ]);

        $restaurantTable = null;

        if ($validated['order_type'] === 'dine_in') {
            $restaurantTable = RestaurantTable::query()
                ->whereKey($validated['table_id'])
                ->firstOrFail();

            if ($restaurantTable->status !== 'available') {
                return back()->withErrors([
                    'table_id' => 'La mesa seleccionada no está disponible.',
                ]);
            }

            if ($restaurantTable->bills()->where('status', 'open')->exists()) {
                return back()->withErrors([
                    'table_id' => 'La mesa ya tiene una cuenta abierta.',
                ]);
            }
        }

        DB::transaction(function () use ($validated, $request, $restaurantTable): void {
            Bill::create([
                'table_id' => $restaurantTable?->id,
                'opening_waiter_id' => $request->user()->id,
                'order_type' => $validated['order_type'],
                'status' => 'open',
                'opened_at' => now(),
            ]);

            $restaurantTable?->update(['status' => 'occupied']);
        });

        return redirect()
            ->route('bills.index')
            ->with('success', 'Cuenta abierta correctamente.');
    }

    public function close(Bill $bill): RedirectResponse
    {
        if ($bill->status === 'closed') {
            return back()->withErrors([
                'bill' => 'Esta cuenta ya se encuentra cerrada.',
            ]);
        }

        if ($bill->balance > 0) {
            return back()->withErrors([
                'bill' => 'No se puede cerrar la cuenta porque tiene un saldo pendiente de S/. '.number_format($bill->balance, 2).'. Por favor registre el pago primero.',
            ]);
        }

        DB::transaction(function () use ($bill): void {
            $bill->update([
                'status' => 'closed',
                'closed_at' => now(),
            ]);

            $restaurantTable = $bill->restaurantTable;

            if (
                $restaurantTable !== null
                && in_array($restaurantTable->status, ['occupied', 'awaiting_payment'], true)
            ) {
                $restaurantTable->update(['status' => 'available']);
            }
        });

        return redirect()
            ->route('bills.index')
            ->with('success', 'Cuenta cerrada correctamente.');
    }
}
