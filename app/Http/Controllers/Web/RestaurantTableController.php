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
        $restaurantTables = RestaurantTable::orderBy('number')->get();

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

        $table->update([
            'status' => $request->status,
        ]);

        return redirect()
            ->route('tables.index')
            ->with('success', 'Estado actualizado correctamente.');
    }

    public function destroy(RestaurantTable $table): RedirectResponse
    {
        $table->delete();

        return redirect()
            ->route('tables.index')
            ->with('success', 'Mesa eliminada correctamente.');
    }
}
