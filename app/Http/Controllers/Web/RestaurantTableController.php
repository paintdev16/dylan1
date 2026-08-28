<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\RestaurantTable;
use App\Models\TableSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class RestaurantTableController extends Controller
{
    public function index(): Response
    {
        $restaurantTables = RestaurantTable::with([
            'activeSession.waiter',
            'activeSession.bill.orders.items',
        ])
            ->orderBy('number')
            ->get();

        return inertia('tables/index', compact('restaurantTables'));
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'number' => ['required', 'integer', 'min:1', 'unique:restaurant_tables,number'],
            'capacity' => ['required', 'integer', 'min:1'],
        ]);

        RestaurantTable::create([
            'number' => $validated['number'],
            'capacity' => $validated['capacity'],
            'status' => 'available',
        ]);

        return redirect()
            ->route('tables.index')
            ->with('success', 'Mesa creada correctamente.');
    }

    public function update(Request $request, RestaurantTable $table): RedirectResponse
    {
        $validated = $request->validate([
            'number' => [
                'required',
                'integer',
                'min:1',
                'unique:restaurant_tables,number,'.$table->id,
            ],
            'capacity' => [
                'required',
                'integer',
                'min:1',
            ],
        ]);

        $table->update($validated);

        return redirect()
            ->route('tables.index')
            ->with('success', 'Mesa actualizada correctamente.');
    }

    public function updateStatus(Request $request, RestaurantTable $table): RedirectResponse
    {
        $request->validate([
            'status' => ['required', 'in:available,out_of_service'],
        ]);

        if ($table->status === 'occupied') {
            return back()->withErrors([
                'status' => 'No se puede cambiar el estado de una mesa ocupada. Debe cerrarse la sesión primero.',
            ]);
        }

        $table->update([
            'status' => $request->status,
        ]);

        return redirect()
            ->route('tables.index')
            ->with('success', 'Estado actualizado correctamente.');
    }

    public function openSession(Request $request, RestaurantTable $table): RedirectResponse
    {
        $validated = $request->validate([
            'customer_count' => ['required', 'integer', 'min:1', 'max:50'],
        ]);

        return DB::transaction(function () use ($request, $table, $validated) {
            $lockedTable = RestaurantTable::where('id', $table->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedTable->status !== 'available') {
                return back()->withErrors([
                    'table' => 'La mesa #'.$lockedTable->number.' no está disponible para ser abierta.',
                ]);
            }

            if ($lockedTable->activeSession()->exists()) {
                return back()->withErrors([
                    'table' => 'La mesa #'.$lockedTable->number.' ya cuenta con una sesión de atención activa.',
                ]);
            }

            $session = TableSession::create([
                'restaurant_table_id' => $lockedTable->id,
                'waiter_id' => $request->user()->id,
                'customer_count' => $validated['customer_count'],
                'status' => 'open',
                'opened_at' => now(),
            ]);

            Bill::create([
                'table_session_id' => $session->id,
                'table_id' => $lockedTable->id,
                'opening_waiter_id' => $request->user()->id,
                'order_type' => 'dine_in',
                'status' => 'open',
                'opened_at' => now(),
            ]);

            $lockedTable->update(['status' => 'occupied']);

            return redirect()
                ->route('tables.index')
                ->with('success', 'Mesa #'.$lockedTable->number.' abierta correctamente para '.$validated['customer_count'].' comensales.');
        });
    }

    public function destroy(RestaurantTable $table): RedirectResponse
    {
        if ($table->status === 'occupied') {
            return back()->withErrors([
                'table' => 'No se puede eliminar una mesa que actualmente se encuentra ocupada.',
            ]);
        }

        $table->delete();

        return redirect()
            ->route('tables.index')
            ->with('success', 'Mesa eliminada correctamente.');
    }
}
