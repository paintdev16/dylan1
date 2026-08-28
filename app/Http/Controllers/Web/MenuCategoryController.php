<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\MenuCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Response;

class MenuCategoryController extends Controller
{
    /**
     * Mostrar categorías.
     */
    public function index(): Response
    {
        $menuCategories = MenuCategory::query()
            ->orderBy('display_order')
            ->orderBy('name')
            ->get();

        return inertia('menu-categories/index', [
            'menuCategories' => $menuCategories,
        ]);
    }

    /**
     * Crear categoría.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:menu_categories,name',
            ],
            'display_order' => [
                'required',
                'integer',
                'min:0',
            ],
            'active' => [
                'required',
                'boolean',
            ],
        ]);

        MenuCategory::create($validated);

        return redirect()
            ->route('menu-categories.index')
            ->with('success', 'Categoría creada correctamente.');
    }

    /**
     * Actualizar categoría.
     */
    public function update(
        Request $request,
        MenuCategory $menuCategory
    ): RedirectResponse {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('menu_categories', 'name')
                    ->ignore($menuCategory->id),
            ],
            'display_order' => [
                'required',
                'integer',
                'min:0',
            ],
            'active' => [
                'required',
                'boolean',
            ],
        ]);

        $menuCategory->update($validated);

        return redirect()
            ->route('menu-categories.index')
            ->with('success', 'Categoría actualizada correctamente.');
    }

    /**
     * Eliminar categoría.
     */
    public function destroy(MenuCategory $menuCategory): RedirectResponse
    {
        $menuCategory->delete();

        return redirect()
            ->route('menu-categories.index')
            ->with('success', 'Categoría eliminada correctamente.');
    }
}
