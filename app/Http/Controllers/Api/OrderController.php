<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\DestroyOrderRequest;
use App\Http\Requests\Api\IndexOrderRequest;
use App\Http\Requests\Api\StoreOrderRequest;
use App\Http\Requests\Api\UpdateOrderStatusRequest;
use App\Http\Requests\Orders\StoreTableOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Bill;
use App\Models\DailyMenu;
use App\Models\DailyMenuProduct;
use App\Models\Order;
use App\Models\Product;
use App\Models\RestaurantTable;
use App\Services\OrderLifecycleService;
use App\Services\TableOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function __construct(
        private readonly TableOrderService $tableOrderService,
        private readonly OrderLifecycleService $orderLifecycleService,
    ) {}

    public function index(IndexOrderRequest $request): AnonymousResourceCollection
    {
        $validated = $request->validated();

        $orders = OrderResource::collection(
            Order::query()
                ->with($this->relations())
                ->when($validated['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
                ->when($validated['table_id'] ?? null, fn ($query, $tableId) => $query->whereHas('bill', fn ($billQuery) => $billQuery->where('table_id', $tableId)))
                ->latest()
                ->paginate($validated['per_page'] ?? 20)
                ->withQueryString()
        );

        $todayDate = now('America/Lima')->toDateString();
        $todayDailyMenu = DailyMenu::query()->whereDate('date', $todayDate)->where('active', true)->first();

        $tables = RestaurantTable::query()
            ->with([
                'activeSession.waiter', 'activeSession.bill.orders.user',
                'activeSession.bill.orders.items.product.menuCategory',
                'activeSession.bill.orders.items.menuModality',
                'activeSession.bill.orders.items.dailyMenuProducts.product',
            ])
            ->orderBy('number')
            ->get();

        $products = Product::query()
            ->with(['menuCategory', 'menuSubcategory', 'menuSubcategoryType', 'productStock'])
            ->where('status', 'active')
            ->whereHas('menuCategory', fn ($query) => $query->where('code', 'beverages'))
            ->whereHas('productStock', fn ($query) => $query->where('quantity', '>', 0))
            ->orderBy('name')
            ->get();

        $dailyMenuProducts = $todayDailyMenu
            ? DailyMenuProduct::query()
                ->with(['product.menuCategory', 'product.menuSubcategory', 'product.menuSubcategoryType'])
                ->where('daily_menu_id', $todayDailyMenu->id)
                ->where('active', true)
                ->where('quantity_available', '>', 0)
                ->orderBy('display_order')
                ->get()
            : collect();

        $menuModalities = $todayDailyMenu
            ? $todayDailyMenu->menuModalities()->with('items')->where('active', true)->orderBy('display_order')->get()
            : collect();

        return $orders->additional([
            'tables' => $tables,
            'products' => $products,
            'menu_modalities' => $menuModalities,
            'daily_menu_products' => $dailyMenuProducts,
        ]);
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $bill = Bill::query()->whereKey($validated['bill_id'])->firstOrFail();
        $order = $this->orderLifecycleService->createForBill($bill, $request->user(), $validated);

        return (new OrderResource($order->load($this->relations())))->response()->setStatusCode(201);
    }

    public function storeForTable(StoreTableOrderRequest $request, RestaurantTable $table): JsonResponse
    {
        $order = $this->tableOrderService->create($table, $request->user(), $request->validated());
        $order->load($this->relations());

        return (new OrderResource($order))->response()->setStatusCode($order->wasRecentlyCreated ? 201 : 200);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): OrderResource
    {
        $status = $request->validated('status');
        $nextStatus = [
            'pending' => 'sent_to_kitchen',
            'sent_to_kitchen' => 'completed',
        ][$order->status] ?? null;

        if ($nextStatus !== $status) {
            throw ValidationException::withMessages([
                'status' => ['El estado de la comanda no puede retroceder ni saltar pasos.'],
            ]);
        }

        $order->update(['status' => $status]);

        return new OrderResource($order->load($this->relations()));
    }

    public function destroy(DestroyOrderRequest $request, Order $order): Response
    {
        $this->orderLifecycleService->delete($order);

        return response()->noContent();
    }

    /** @return array<int, string> */
    private function relations(): array
    {
        return [
            'bill.restaurantTable', 'bill.orders.items', 'bill.payments', 'user',
            'items.product', 'items.menuModality', 'items.orderItemMenuProducts.dailyMenuProduct.product',
        ];
    }
}
