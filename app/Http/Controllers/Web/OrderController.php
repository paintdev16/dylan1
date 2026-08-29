<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\Orders\StoreTableOrderRequest;
use App\Models\Bill;
use App\Models\DailyMenu;
use App\Models\DailyMenuProduct;
use App\Models\Order;
use App\Models\OrderItemMenuProduct;
use App\Models\Product;
use App\Models\RestaurantTable;
use App\Services\OrderStockService;
use App\Services\TableOrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderStockService $stockService,
        private readonly TableOrderService $tableOrderService,
    ) {}

    public function index(): Response
    {
        $todayDate = now('America/Lima')->toDateString();

        $orders = Order::query()
            ->with([
                'bill.restaurantTable',
                'user',
                'items.product.menuCategory',
                'items.menuModality',
                'items.dailyMenuProducts.product.menuSubcategoryType',
            ])
            ->latest()
            ->get();

        $tables = RestaurantTable::query()
            ->with(['activeSession.waiter', 'activeSession.bill.orders.user', 'activeSession.bill.orders.items.product.menuCategory', 'activeSession.bill.orders.items.menuModality', 'activeSession.bill.orders.items.dailyMenuProducts.product'])
            ->orderBy('number')
            ->get();

        $products = Product::query()
            ->with(['menuCategory', 'menuSubcategory', 'menuSubcategoryType', 'productStock'])
            ->where('status', 'activo')
            ->whereHas('menuCategory', fn ($query) => $query->where('name', 'Bebidas'))
            ->whereHas('productStock', fn ($query) => $query->where('quantity', '>', 0))
            ->orderBy('name')
            ->get();

        $todayDailyMenu = DailyMenu::where('date', $todayDate)
            ->where('active', true)
            ->first();

        $dailyMenuProducts = $todayDailyMenu
            ? DailyMenuProduct::with(['product.menuCategory', 'product.menuSubcategory', 'product.menuSubcategoryType'])
                ->where('daily_menu_id', $todayDailyMenu->id)
                ->where('active', true)
                ->where('quantity_available', '>', 0)
                ->orderBy('display_order')
                ->get()
            : collect();

        $menuModalities = $todayDailyMenu
            ? $todayDailyMenu->menuModalities()
                ->with('items')
                ->where('active', true)
                ->orderBy('display_order')
                ->get()
            : collect();

        return inertia('orders/index', compact(
            'orders',
            'tables',
            'products',
            'menuModalities',
            'dailyMenuProducts'
        ));
    }

    public function storeForTable(StoreTableOrderRequest $request, RestaurantTable $table): RedirectResponse
    {
        $this->tableOrderService->create($table, $request->user(), $request->validated());

        return redirect()->route('orders.index')->with('success', 'Comanda confirmada correctamente.');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'bill_id' => ['required', 'integer', 'exists:bills,id'],
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
            'menu_modality_id' => ['nullable', 'integer', 'exists:menu_modalities,id'],
            'components' => ['nullable', 'array'],
            'components.*' => ['integer', 'exists:daily_menu_products,id'],
            'quantity' => ['nullable', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $bill = Bill::query()->whereKey($validated['bill_id'])->firstOrFail();

        if ($bill->status !== 'open') {
            return back()->withErrors([
                'bill_id' => 'No se pueden registrar pedidos en una cuenta cerrada.',
            ]);
        }

        DB::transaction(function () use ($validated, $request, $bill): void {
            $order = Order::create([
                'bill_id' => $bill->id,
                'user_id' => $request->user()->id,
                'status' => 'enviado_cocina',
            ]);

            // Create initial item if specified
            $productId = $validated['product_id'] ?? null;
            $menuModalityId = $validated['menu_modality_id'] ?? null;

            if ($productId || $menuModalityId) {
                $quantity = $validated['quantity'] ?? 1;

                $stockResult = $this->stockService->reserveStockForOrderItem($validated, $quantity);

                $kitchenStatus = 'pendiente';
                if ($productId) {
                    $prod = Product::query()->with('menuCategory')->whereKey($productId)->first();
                    if ($prod?->menuCategory?->name === 'Bebidas') {
                        $kitchenStatus = 'entregado';
                    }
                }

                $orderItem = $order->items()->create([
                    'product_id' => $productId,
                    'menu_modality_id' => $menuModalityId,
                    'daily_menu_product_id' => $stockResult['daily_menu_product_id'],
                    'quantity' => $quantity,
                    'notes' => $validated['notes'] ?? null,
                    'unit_price' => $stockResult['unit_price'],
                    'subtotal' => $stockResult['subtotal'],
                    'kitchen_status' => $kitchenStatus,
                ]);

                foreach ($stockResult['component_ids'] as $dmpId) {
                    OrderItemMenuProduct::create([
                        'order_item_id' => $orderItem->id,
                        'daily_menu_product_id' => $dmpId,
                        'quantity' => $quantity,
                    ]);
                }
            }
        });

        return redirect()
            ->route('orders.index')
            ->with('success', 'Comanda registrada correctamente.');
    }

    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:enviado_cocina,completado'],
        ]);

        $nextStatuses = [
            'pendiente' => 'enviado_cocina',
            'enviado_cocina' => 'completado',
        ];

        if (($nextStatuses[$order->status] ?? null) !== $validated['status']) {
            return back()->withErrors([
                'status' => 'El estado de la comanda no puede retroceder ni saltar pasos.',
            ]);
        }

        $order->update(['status' => $validated['status']]);

        return redirect()
            ->route('orders.index')
            ->with('success', 'Estado de la comanda actualizado.');
    }

    public function destroy(Order $order): RedirectResponse
    {
        if ($order->items()->where('kitchen_status', '!=', 'pendiente')->exists()) {
            return back()->withErrors([
                'order' => 'No se puede eliminar una comanda cuyos productos ya están en preparación en cocina.',
            ]);
        }

        DB::transaction(function () use ($order): void {
            foreach ($order->items as $item) {
                $this->stockService->restoreStockForOrderItem($item);
            }
            $order->delete();
        });

        return redirect()
            ->route('orders.index')
            ->with('success', 'Comanda eliminada correctamente.');
    }
}
