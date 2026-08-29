<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\MenuCategory;
use App\Models\MenuSubcategory;
use App\Models\MenuSubcategoryType;
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
            'menuSubcategoryType',
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
                        ->with([
                            'types' => function ($query) {
                                $query->where('active', true)
                                    ->orderBy('display_order')
                                    ->orderBy('name');
                            },
                        ])
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
        $validated = $request->validate($this->rules($request));

        $initialStock = $validated['initial_stock'] ?? null;
        unset($validated['initial_stock']);

        $validated = $this->normalizeProductData($validated);

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
        $validated = $request->validate($this->rules($request, $product));

        $validated = $this->normalizeProductData($validated);

        $product->update($validated);

        return redirect()
            ->route('products.index')
            ->with('success', 'Producto actualizado correctamente.');
    }

    public function updateStatus(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['active', 'inactive'])],
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
     * Normaliza los campos según la categoría y subcategoría.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function normalizeProductData(array $data): array
    {
        $category = MenuCategory::query()->whereKey($data['menu_category_id'] ?? null)->first();

        if ($category && $category->code === 'beverages') {
            $data['menu_subcategory_id'] = null;
            $data['menu_subcategory_type_id'] = null;
            $data['type'] = 'simple';
        } else {
            $subcategory = isset($data['menu_subcategory_id'])
                ? MenuSubcategory::query()->whereKey($data['menu_subcategory_id'])->first()
                : null;

            if ($subcategory && $subcategory->code === 'special_dishes') {
                $data['menu_subcategory_type_id'] = null;
            }
        }

        return $data;
    }

    /**
     * Reglas de validación para crear y actualizar productos.
     *
     * @return array<string, array<int, mixed>>
     */
    private function rules(Request $request, ?Product $product = null): array
    {
        $categoryId = $request->input('menu_category_id');
        $category = $categoryId ? MenuCategory::query()->whereKey($categoryId)->first() : null;
        $isBeverage = $category && $category->code === 'beverages';
        $isFood = $category && $category->code === 'food';

        $subcategoryId = $request->input('menu_subcategory_id');
        $subcategory = $subcategoryId ? MenuSubcategory::query()->whereKey($subcategoryId)->first() : null;
        $isEconomicMenu = $subcategory && $subcategory->code === 'economic_menu';

        return [
            'menu_category_id' => [
                'required',
                'exists:menu_categories,id',
            ],

            'menu_subcategory_id' => [
                $isBeverage ? 'nullable' : 'required',
                'nullable',
                'exists:menu_subcategories,id',
                function ($attribute, $value, $fail) use ($isBeverage, $categoryId) {
                    if ($isBeverage && ! empty($value)) {
                        $fail('Las bebidas no deben tener subcategoría asignada.');

                        return;
                    }

                    if (! $value) {
                        return;
                    }

                    $sub = MenuSubcategory::query()->whereKey($value)->first();
                    if (! $sub || (int) $sub->menu_category_id !== (int) $categoryId) {
                        $fail('La subcategoría no pertenece a la categoría seleccionada.');
                    }
                },
            ],

            'menu_subcategory_type_id' => [
                $isEconomicMenu ? 'required' : 'nullable',
                'nullable',
                'exists:menu_subcategory_types,id',
                function ($attribute, $value, $fail) use ($isEconomicMenu, $subcategoryId) {
                    if (! $isEconomicMenu && ! empty($value)) {
                        $fail('Solo los productos del Menú Económico pueden tener un tipo asignado.');

                        return;
                    }

                    if (! $value) {
                        return;
                    }

                    $type = MenuSubcategoryType::query()->whereKey($value)->first();
                    if (! $type || (int) $type->menu_subcategory_id !== (int) $subcategoryId) {
                        $fail('El tipo de menú seleccionado no pertenece a la subcategoría Menú Económico.');
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
                Rule::in(['active', 'inactive']),
            ],

            'initial_stock' => [
                'nullable',
                'integer',
                'min:0',
                function ($attribute, $value, $fail) use ($isBeverage) {
                    if ($value === null || $value === '') {
                        return;
                    }

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
