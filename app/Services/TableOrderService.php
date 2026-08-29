<?php

namespace App\Services;

use App\Models\Bill;
use App\Models\Order;
use App\Models\OrderItemMenuProduct;
use App\Models\Product;
use App\Models\RestaurantTable;
use App\Models\TableSession;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TableOrderService
{
    public function __construct(private readonly OrderStockService $stockService) {}

    /** @param array<string, mixed> $data */
    public function create(RestaurantTable $table, User $waiter, array $data): Order
    {
        return DB::transaction(function () use ($table, $waiter, $data): Order {
            $lockedTable = RestaurantTable::query()->whereKey($table->id)->lockForUpdate()->firstOrFail();

            if ($lockedTable->status === 'out_of_service') {
                throw ValidationException::withMessages(['table' => 'La mesa está fuera de servicio.']);
            }

            $items = $data['items'] ?? [$data];
            $session = TableSession::query()
                ->where('restaurant_table_id', $lockedTable->id)
                ->where('status', 'open')
                ->lockForUpdate()
                ->first();

            if (! $session) {
                if ($lockedTable->status !== 'available') {
                    throw ValidationException::withMessages(['table' => 'La mesa no está disponible.']);
                }

                if (! isset($data['customer_count'])) {
                    throw ValidationException::withMessages([
                        'customer_count' => 'Indica la cantidad de comensales para abrir la mesa.',
                    ]);
                }

                $session = TableSession::create([
                    'restaurant_table_id' => $lockedTable->id,
                    'waiter_id' => $waiter->id,
                    'customer_count' => (int) $data['customer_count'],
                    'status' => 'open',
                    'opened_at' => now(),
                ]);
                $bill = Bill::create([
                    'table_session_id' => $session->id,
                    'table_id' => $lockedTable->id,
                    'opening_waiter_id' => $waiter->id,
                    'order_type' => 'dine_in',
                    'status' => 'open',
                    'opened_at' => now(),
                ]);
                $lockedTable->update(['status' => 'occupied']);
            } else {
                if ($lockedTable->status !== 'occupied') {
                    throw ValidationException::withMessages(['table' => 'La mesa ya no tiene una atención activa.']);
                }

                $bill = Bill::query()
                    ->where('table_session_id', $session->id)
                    ->where('table_id', $lockedTable->id)
                    ->where('status', 'open')
                    ->lockForUpdate()
                    ->firstOrFail();
            }

            $requestToken = $data['request_token'] ?? null;
            if ($requestToken) {
                $existingOrder = Order::query()
                    ->where('request_token', $requestToken)
                    ->first();

                if ($existingOrder) {
                    if ($existingOrder->bill_id !== $bill->id) {
                        throw ValidationException::withMessages([
                            'request_token' => 'El identificador de la comanda no coincide con la cuenta activa.',
                        ]);
                    }

                    return $existingOrder;
                }
            }

            $order = Order::create([
                'bill_id' => $bill->id,
                'user_id' => $waiter->id,
                'request_token' => $requestToken,
                'status' => 'enviado_cocina',
            ]);

            foreach ($items as $itemData) {
                $quantity = (int) $itemData['quantity'];
                $product = isset($itemData['product_id']) ? Product::query()->with('menuCategory')->whereKey($itemData['product_id'])->first() : null;
                $stock = $this->stockService->reserveStockForOrderItem($itemData, $quantity);
                $requiresKitchen = ($itemData['menu_modality_id'] ?? false) || $product?->menuCategory?->name === 'Comidas';
                $item = $order->items()->create(['product_id' => $itemData['product_id'] ?? null, 'menu_modality_id' => $itemData['menu_modality_id'] ?? null, 'daily_menu_product_id' => $stock['daily_menu_product_id'], 'quantity' => $quantity, 'notes' => $itemData['notes'] ?? null, 'unit_price' => $stock['unit_price'], 'subtotal' => $stock['subtotal'], 'kitchen_status' => $requiresKitchen ? 'pendiente' : 'entregado']);
                foreach ($stock['component_ids'] as $dailyMenuProductId) {
                    OrderItemMenuProduct::create(['order_item_id' => $item->id, 'daily_menu_product_id' => $dailyMenuProductId, 'quantity' => $quantity]);
                }
            }

            return $order;
        }, attempts: 3);
    }
}
