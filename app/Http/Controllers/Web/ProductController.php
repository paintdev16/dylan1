<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\MenuCategory;
use App\Models\MenuSubcategory;
use App\Models\Product;
use App\Services\StockService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(private StockService $stockService) {}

    public function index(): Response
    {
        $products = Product::with([
            'menuCategory',
            'menuSubcategory',
            'productStock',
        ])
            ->withExists([
                'dailyMenuProducts as has_daily_menu_products',
            ])
            ->withSum([
                'dailyMenuProducts as daily_menu_quantity' => function ($query) {
                    $query
                        ->where('active', true)
                        ->whereHas('dailyMenu', function ($query) {
                            $query->whereDate('date', today());
                        });
                },
            ], 'quantity_available')
            ->orderBy('name')
            ->get();

        $categories = MenuCategory::where('active', true)
            ->with([
                'menuSubcategories' => function ($query) {
                    $query->where('active', true)
                        ->orderBy('display_order')
                        ->orderBy('name');
                },
            ])
            ->orderBy('display_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('products/index', [
            'products' => $products,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->rules());

        $initialStock = $validated['initial_stock'] ?? null;
        unset($validated['initial_stock']);

        DB::transaction(function () use ($validated, $initialStock): void {
            $product = Product::create($validated);

            if ((int) $initialStock > 0) {
                $this->stockService->add(
                    $product,
                    (int) $initialStock,
                    'Stock inicial del producto.'
                );
            }
        });

        return redirect()
            ->route('products.index')
            ->with('success', 'Producto creado correctamente.');
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate($this->rules($product));

        $product->update($validated);

        return redirect()
            ->route('products.index')
            ->with('success', 'Producto actualizado correctamente.');
    }

    public function updateStatus(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['activo', 'inactivo'])],
        ]);

        $product->update([
            'status' => $validated['status'],
        ]);

        return back()->with(
            'success',
            'Estado del producto actualizado correctamente.'
        );
    }

    public function destroy(Product $product): RedirectResponse
    {
        if ($product->dailyMenuProducts()->exists()) {
            return back()->with(
                'error',
                'No se puede eliminar este producto porque ya tiene registros asociados en menús diarios.'
            );
        }

        $product->delete();

        return back()->with('success', 'Producto eliminado correctamente.');
    }

    /**
     * Reglas de validación para crear y actualizar productos.
     */
    /** @return array<string, array<int, mixed>> */
    private function rules(?Product $product = null): array
    {
        return [
            'menu_category_id' => [
                'required',
                'exists:menu_categories,id',
            ],

            'menu_subcategory_id' => [
                'nullable',
                'exists:menu_subcategories,id',
                function ($attribute, $value, $fail) {
                    if (! $value) {
                        return;
                    }

                    $subcategory = MenuSubcategory::query()->whereKey($value)->first();

                    if (! $subcategory) {
                        return;
                    }

                    $categoryId = request('menu_category_id');

                    if ((int) $subcategory->menu_category_id !== (int) $categoryId) {
                        $fail(
                            'La subcategoría no pertenece a la categoría seleccionada.'
                        );
                    }
                },
            ],

            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'presentation' => [
                'nullable',
                'string',
                'max:255',
            ],

            'price' => [
                'required',
                'numeric',
                'min:0',
            ],

            'image' => [
                'nullable',
                'string',
                'max:255',
            ],

            'type' => [
                'required',
                Rule::in(['simple', 'prepared']),
            ],

            'status' => [
                'required',
                Rule::in(['activo', 'inactivo']),
            ],

            'initial_stock' => [
                'nullable',
                'integer',
                'min:0',
                function ($attribute, $value, $fail) {
                    if ($value === null || $value === '') {
                        return;
                    }

                    $isBeverage = MenuCategory::whereKey(
                        request()->input('menu_category_id')
                    )
                        ->where('name', 'Bebidas')
                        ->exists();

                    if (! $isBeverage) {
                        $fail(
                            'La cantidad inicial solo se puede registrar para bebidas.'
                        );
                    }
                },
            ],
        ];
    }
}
