<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\RestaurantTable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
        $validated = $request->validate([
            'status' => ['required', 'in:available,reserved,out_of_service'],
        ]);

        if ($table->status === 'occupied') {
            return back()->withErrors([
                'status' => 'No se puede cambiar el estado de una mesa ocupada. Debe cerrarse la sesión primero.',
            ]);
        }

        if (
            $table->status === 'out_of_service'
            && $validated['status'] === 'available'
            && ! $request->user()->hasRole('super-admin')
        ) {
            abort(403, 'Solo un superadministrador puede rehabilitar una mesa fuera de servicio.');
        }

        $table->update([
            'status' => $validated['status'],
        ]);

        return redirect()
            ->route('tables.index')
            ->with('success', 'Estado actualizado correctamente.');
    }
}
