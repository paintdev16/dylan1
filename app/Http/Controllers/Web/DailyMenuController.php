<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\DailyMenu;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Response;

class DailyMenuController extends Controller
{
    /**
     * Mostrar los menús del día.
     */
    public function index(): Response
    {
        $today = today();

        $dailyMenus = DailyMenu::with([
            'dailyMenuProducts.product',
        ])
            ->orderByDesc('date')
            ->get()
            ->map(function (DailyMenu $dailyMenu) use ($today) {

                // Un menú de una fecha pasada se considera inactivo
                // aunque en BD tenga active = true.
                $isPast = $dailyMenu->date->isBefore($today);

                return [
                    'id' => $dailyMenu->id,
                    'date' => $dailyMenu->date->format('Y-m-d'),
                    'formatted_date' => $dailyMenu->formatted_date,

                    // Fecha pasada => siempre inactivo
                    'active' => $isPast ? false : $dailyMenu->active,

                    'products' => $dailyMenu->dailyMenuProducts
                        ->sortBy('display_order')
                        ->values()
                        ->map(function ($dailyMenuProduct) {
                            return [
                                'id' => $dailyMenuProduct->id,
                                'product_id' => $dailyMenuProduct->product_id,
                                'product_name' => $dailyMenuProduct->product->name,
                                'price' => $dailyMenuProduct->price,
                                'quantity_available' => $dailyMenuProduct->quantity_available,
                                'display_order' => $dailyMenuProduct->display_order,
                                'active' => $dailyMenuProduct->active,
                            ];
                        }),
                ];
            });

        return inertia('daily-menus/index', [
            'dailyMenus' => $dailyMenus,
        ]);
    }

    /**
     * Crear un menú del día.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'date' => [
                'required',
                'date',
                'after_or_equal:today',
                'unique:daily_menus,date',
            ],
            'active' => [
                'required',
                'boolean',
            ],
        ]);

        DailyMenu::create($validated);

        return redirect()
            ->route('daily-menus.index')
            ->with(
                'success',
                'Menú del día creado correctamente.'
            );
    }

    /**
     * Actualizar un menú del día.
     */
    public function update(
        Request $request,
        DailyMenu $dailyMenu
    ): RedirectResponse {
        /*
        |--------------------------------------------------------------------------
        | No permitir editar menús de fechas pasadas
        |--------------------------------------------------------------------------
        */

        if ($dailyMenu->date->isBefore(today())) {
            return back()->withErrors([
                'dailyMenu' => 'No se puede editar un menú de una fecha pasada.',
            ]);
        }

        $validated = $request->validate([
            'date' => [
                'required',
                'date',
                'after_or_equal:today',
                Rule::unique('daily_menus', 'date')
                    ->ignore($dailyMenu->id),
            ],
            'active' => [
                'required',
                'boolean',
            ],
        ]);

        $dailyMenu->update($validated);

        return redirect()
            ->route('daily-menus.index')
            ->with(
                'success',
                'Menú del día actualizado correctamente.'
            );
    }

    /**
     * Eliminar un menú del día.
     */
    public function destroy(DailyMenu $dailyMenu): RedirectResponse
    {
        /*
        |--------------------------------------------------------------------------
        | No permitir eliminar menús de fechas pasadas
        |--------------------------------------------------------------------------
        */

        if ($dailyMenu->date->isBefore(today())) {
            return back()->withErrors([
                'dailyMenu' => 'No se puede eliminar un menú de una fecha pasada.',
            ]);
        }

        $dailyMenu->delete();

        return redirect()
            ->route('daily-menus.index')
            ->with(
                'success',
                'Menú del día eliminado correctamente.'
            );
    }
}
