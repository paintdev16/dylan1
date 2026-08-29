<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\UpdateOrderStatusRequest;
use App\Http\Requests\Orders\StoreTableOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\RestaurantTable;
use App\Services\TableOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function __construct(private readonly TableOrderService $tableOrderService) {}

    public function index(): AnonymousResourceCollection
    {
        return OrderResource::collection(
            Order::query()->with($this->relations())->latest()->paginate(20)
        );
    }

    public function storeForTable(StoreTableOrderRequest $request, RestaurantTable $table): JsonResponse
    {
        $order = $this->tableOrderService->create($table, $request->user(), $request->validated());
        $order->load($this->relations());

        return (new OrderResource($order))->response()->setStatusCode(201);
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

    /** @return array<int, string> */
    private function relations(): array
    {
        return [
            'bill.restaurantTable', 'bill.orders.items', 'bill.payments', 'user',
            'items.product', 'items.menuModality', 'items.orderItemMenuProducts.dailyMenuProduct.product',
        ];
    }
}
