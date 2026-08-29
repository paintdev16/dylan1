<?php

namespace App\Http\Controllers;

use App\Models\DailyMenu;
use App\Models\DailyMenuProduct;
use App\Models\MenuModality;
use App\Models\MenuSubcategory;
use App\Models\MenuSubcategoryType;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DailyMenuProductController extends Controller
{
    public function index(): Response
    {
        $todayDate = now('America/Lima')->toDateString();

        $dailyMenu = DailyMenu::firstOrCreate(
            [
                'date' => $todayDate,
            ],
            [
                'active' => false,
            ]
        );

        $this->ensureDefaultModalitiesExist($dailyMenu);

        $dailyMenuProducts = DailyMenuProduct::with([
            'product.menuCategory',
            'product.menuSubcategory',
            'product.menuSubcategoryType',
        ])
            ->where('daily_menu_id', $dailyMenu->id)
            ->orderBy('display_order')
            ->get();

        $menuModalities = $dailyMenu->menuModalities()
            ->orderBy('display_order')
            ->get();

        $menuSubcategories = MenuSubcategory::with([
            'menuCategory',
            'types' => function ($query) {
                $query
                    ->where('active', true)
                    ->orderBy('display_order')
                    ->orderBy('name');
            },
        ])
            ->where('active', true)
            ->whereHas('menuCategory', function ($query) {
                $query->where('name', 'Comidas');
            })
            ->orderBy('display_order')
            ->orderBy('name')
            ->get();

        $products = Product::with([
            'menuCategory',
            'menuSubcategory',
            'menuSubcategoryType',
        ])
            ->where('status', 'activo')
            ->whereHas('menuCategory', function ($query) {
                $query->where('name', 'Comidas');
            })
            ->whereHas('menuSubcategory', function ($query) {
                $query->where('active', true);
            })
            ->where(function ($query) {
                $query
                    ->whereNull('menu_subcategory_type_id')
                    ->orWhereHas('menuSubcategoryType', function ($query) {
                        $query->where('active', true);
                    });
            })
            ->orderBy('name')
            ->get();

        $pastMenus = DailyMenu::with([
            'dailyMenuProducts.product.menuCategory',
            'dailyMenuProducts.product.menuSubcategory',
            'dailyMenuProducts.product.menuSubcategoryType',
        ])
            ->where('date', '<', $todayDate)
            ->orderByDesc('date')
            ->limit(10)
            ->get()
            ->map(fn (DailyMenu $menu) => [
                'id' => $menu->id,
                'date' => $menu->date->format('Y-m-d'),
                'formatted_date' => $menu->formatted_date,
                'active' => false,
                'products_count' => $menu->dailyMenuProducts->count(),
                'products' => $menu->dailyMenuProducts->map(fn ($item) => [
                    'id' => $item->id,
                    'product_name' => $item->product->name,
                    'subcategory_name' => $item->product->menuSubcategory?->name,
                    'type_name' => $item->product->menuSubcategoryType?->name,
                    'price' => $item->price,
                    'quantity_available' => $item->quantity_available,
                    'active' => $item->active,
                ]),
            ]);

        return Inertia::render('daily-menu-products/index', [
            'dailyMenu' => $dailyMenu,
            'dailyMenuProducts' => $dailyMenuProducts,
            'menuModalities' => $menuModalities,
            'products' => $products,
            'menuSubcategories' => $menuSubcategories,
            'pastMenus' => $pastMenus,
        ]);
    }

    public function updateModality(Request $request, MenuModality $menuModality): RedirectResponse
    {
        $todayDate = now('America/Lima')->toDateString();

        if ($menuModality->dailyMenu()->firstOrFail()->date->format('Y-m-d') < $todayDate) {
            return back()->withErrors([
                'daily_menu' => 'No se puede modificar una modalidad de un menú de una fecha pasada.',
            ]);
        }

        $validated = $request->validate([
            'price' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string', 'max:500'],
            'active' => ['required', 'boolean'],
        ]);

        $menuModality->update($validated);

        return back()->with('success', 'Modalidad actualizada correctamente.');
    }

    private function ensureDefaultModalitiesExist(DailyMenu $dailyMenu): void
    {
        $defaultModalities = [
            [
                'code' => 'full_menu',
                'name' => 'Menú completo',
                'description' => 'Segundo + entrada + postre.',
                'price' => 14.00,
                'display_order' => 1,
                'active' => true,
            ],
            [
                'code' => 'main_only',
                'name' => 'Solo segundo',
                'description' => 'Solo segundo del menú económico.',
                'price' => 9.00,
                'display_order' => 2,
                'active' => true,
            ],
            [
                'code' => 'starter_dessert',
                'name' => 'Entrada + postre',
                'description' => 'Una entrada + un postre.',
                'price' => 5.00,
                'display_order' => 3,
                'active' => true,
            ],
        ];

        foreach ($defaultModalities as $modality) {
            MenuModality::firstOrCreate(
                [
                    'daily_menu_id' => $dailyMenu->id,
                    'code' => $modality['code'],
                ],
                $modality
            );
        }
    }

    public function updateMenuStatus(Request $request, DailyMenu $dailyMenu): RedirectResponse
    {
        $todayDate = now('America/Lima')->toDateString();

        if ($dailyMenu->date->format('Y-m-d') < $todayDate) {
            return back()->withErrors([
                'daily_menu' => 'No se puede activar o desactivar un menú de una fecha pasada.',
            ]);
        }

        $validated = $request->validate([
            'active' => ['required', 'boolean'],
        ]);

        $dailyMenu->update($validated);

        return back()->with(
            'success',
            $validated['active']
                ? 'Menú del día activado correctamente.'
                : 'Menú del día guardado como borrador.'
        );
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateData($request);

        $dailyMenu = DailyMenu::query()->whereKey($validated['daily_menu_id'])->firstOrFail();
        $todayDate = now('America/Lima')->toDateString();

        if ($dailyMenu->date->format('Y-m-d') < $todayDate) {
            return back()->withErrors([
                'daily_menu' => 'No se puede agregar productos a un menú de una fecha pasada.',
            ]);
        }

        $product = $this->validateProduct(
            $validated['product_id'],
            $validated['menu_subcategory_id'],
            $validated['menu_subcategory_type_id'] ?? null
        );

        if (! $product) {
            return back()
                ->withErrors([
                    'product_id' => 'El producto no pertenece al tipo de comida seleccionado.',
                ])
                ->withInput();
        }

        $exists = DailyMenuProduct::where(
            'daily_menu_id',
            $validated['daily_menu_id']
        )
            ->where(
                'product_id',
                $validated['product_id']
            )
            ->exists();

        if ($exists) {
            return back()
                ->withErrors([
                    'product_id' => 'Este producto ya está agregado al menú del día.',
                ])
                ->withInput();
        }

        $dailyMenuProduct = DailyMenuProduct::create([
            'daily_menu_id' => $validated['daily_menu_id'],
            'product_id' => $validated['product_id'],
            'price' => $validated['price'],
            'quantity_available' => $validated['quantity_available'],
            'display_order' => $validated['display_order'],
            'active' => $validated['active'],
        ]);

        $this->synchronizeComplementaryProductQuantities(
            $dailyMenuProduct->daily_menu_id
        );

        return redirect()
            ->route('daily-menu-products.index')
            ->with(
                'success',
                'Producto agregado al menú del día.'
            );
    }

    public function update(
        Request $request,
        DailyMenuProduct $dailyMenuProduct
    ): RedirectResponse {
        $todayDate = now('America/Lima')->toDateString();
        if ($dailyMenuProduct->dailyMenu->date->format('Y-m-d') < $todayDate) {
            return back()->withErrors([
                'daily_menu' => 'No se puede modificar un producto de un menú de una fecha pasada.',
            ]);
        }

        $validated = $this->validateData($request);

        $product = $this->validateProduct(
            $validated['product_id'],
            $validated['menu_subcategory_id'],
            $validated['menu_subcategory_type_id'] ?? null
        );

        if (! $product) {
            return back()
                ->withErrors([
                    'product_id' => 'El producto no pertenece al tipo de comida seleccionado.',
                ])
                ->withInput();
        }

        $exists = DailyMenuProduct::where(
            'daily_menu_id',
            $dailyMenuProduct->daily_menu_id
        )
            ->where(
                'product_id',
                $validated['product_id']
            )
            ->where(
                'id',
                '!=',
                $dailyMenuProduct->id
            )
            ->exists();

        if ($exists) {
            return back()
                ->withErrors([
                    'product_id' => 'Este producto ya está agregado al menú del día.',
                ])
                ->withInput();
        }

        $dailyMenuProduct->update([
            'product_id' => $validated['product_id'],
            'price' => $validated['price'],
            'quantity_available' => $validated['quantity_available'],
            'display_order' => $validated['display_order'],
            'active' => $validated['active'],
        ]);

        $this->synchronizeComplementaryProductQuantities(
            $dailyMenuProduct->daily_menu_id
        );

        return redirect()
            ->route('daily-menu-products.index')
            ->with(
                'success',
                'Producto actualizado correctamente.'
            );
    }

    /** @return array<string, mixed> */
    private function validateData(Request $request): array
    {
        $validated = $request->validate([
            'daily_menu_id' => [
                'sometimes',
                'required',
                'exists:daily_menus,id',
            ],

            'menu_subcategory_id' => [
                'required',
                'exists:menu_subcategories,id',
            ],

            'menu_subcategory_type_id' => [
                'nullable',
                'exists:menu_subcategory_types,id',
            ],

            'product_id' => [
                'required',
                'exists:products,id',
            ],

            'price' => [
                'required',
                'numeric',
                'min:0',
            ],

            'quantity_available' => [
                'required',
                'integer',
                'min:0',
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

        $subcategory = MenuSubcategory::where(
            'id',
            $validated['menu_subcategory_id']
        )
            ->where('active', true)
            ->whereHas('menuCategory', function ($query) {
                $query->where('name', 'Comidas');
            })
            ->first();

        if (! $subcategory) {
            abort(
                back()->withErrors([
                    'menu_subcategory_id' => 'El tipo de comida seleccionado no está disponible.',
                ])
            );
        }

        $typeId = $validated['menu_subcategory_type_id'] ?? null;

        if ($subcategory->name === 'Menú Económico' && ! $typeId) {
            abort(
                back()->withErrors([
                    'menu_subcategory_type_id' => 'Debes seleccionar un tipo para el Menú Económico.',
                ])
            );
        }

        if ($typeId) {
            $typeBelongsToSubcategory = MenuSubcategoryType::where(
                'id',
                $typeId
            )
                ->where(
                    'menu_subcategory_id',
                    $subcategory->id
                )
                ->where('active', true)
                ->exists();

            if (! $typeBelongsToSubcategory) {
                abort(
                    back()->withErrors([
                        'menu_subcategory_type_id' => 'El tipo seleccionado no pertenece al tipo de comida seleccionado.',
                    ])
                );
            }
        }

        return $validated;
    }

    private function validateProduct(
        int $productId,
        int $subcategoryId,
        ?int $typeId
    ): ?Product {
        $query = Product::query()
            ->where('id', $productId)
            ->where('status', 'activo')
            ->where(
                'menu_subcategory_id',
                $subcategoryId
            )
            ->whereHas('menuCategory', function ($query) {
                $query->where('name', 'Comidas');
            })
            ->whereHas('menuSubcategory', function ($query) {
                $query->where('active', true);
            });

        if ($typeId) {
            $query->where(
                'menu_subcategory_type_id',
                $typeId
            );
        } else {
            $query->whereNull(
                'menu_subcategory_type_id'
            );
        }

        return $query->first();
    }

    public function destroy(
        DailyMenuProduct $dailyMenuProduct
    ): RedirectResponse {
        $todayDate = now('America/Lima')->toDateString();
        if ($dailyMenuProduct->dailyMenu->date->format('Y-m-d') < $todayDate) {
            return back()->withErrors([
                'daily_menu' => 'No se puede eliminar un producto de un menú de una fecha pasada.',
            ]);
        }

        $dailyMenuId = $dailyMenuProduct->daily_menu_id;

        $dailyMenuProduct->delete();

        $this->synchronizeComplementaryProductQuantities($dailyMenuId);

        return redirect()
            ->route('daily-menu-products.index')
            ->with(
                'success',
                'Producto eliminado correctamente.'
            );
    }

    public function updateStatus(
        Request $request,
        DailyMenuProduct $dailyMenuProduct
    ): RedirectResponse {
        $todayDate = now('America/Lima')->toDateString();
        if ($dailyMenuProduct->dailyMenu->date->format('Y-m-d') < $todayDate) {
            return back()->withErrors([
                'daily_menu' => 'No se puede modificar el estado de un producto de un menú de una fecha pasada.',
            ]);
        }

        $validated = $request->validate([
            'active' => [
                'required',
                'boolean',
            ],
        ]);

        $dailyMenuProduct->update($validated);

        $this->synchronizeComplementaryProductQuantities(
            $dailyMenuProduct->daily_menu_id
        );

        return back()->with(
            'success',
            'Estado del producto actualizado correctamente.'
        );
    }

    private function synchronizeComplementaryProductQuantities(
        int $dailyMenuId
    ): void {
        $secondQuantity = DailyMenuProduct::query()
            ->where('daily_menu_id', $dailyMenuId)
            ->where('active', true)
            ->whereHas('product', function ($query) {
                $query
                    ->whereHas('menuSubcategory', function ($query) {
                        $query->where('name', 'Menú Económico');
                    })
                    ->whereHas('menuSubcategoryType', function ($query) {
                        $query->where('name', 'Segundos');
                    });
            })
            ->sum('quantity_available');

        DailyMenuProduct::query()
            ->where('daily_menu_id', $dailyMenuId)
            ->whereHas('product', function ($query) {
                $query
                    ->whereHas('menuSubcategory', function ($query) {
                        $query->where('name', 'Menú Económico');
                    })
                    ->whereHas('menuSubcategoryType', function ($query) {
                        $query->whereIn('name', ['Entradas', 'Postres']);
                    });
            })
            ->update(['quantity_available' => $secondQuantity]);
    }
}
