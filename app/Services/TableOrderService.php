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
            $firstItem = $items[0];
            $quantity = (int) $firstItem['quantity'];
            $product = isset($firstItem['product_id'])
                ? Product::query()->with(['menuCategory', 'menuSubcategory'])->whereKey($firstItem['product_id'])->first()
                : null;

            $session = TableSession::query()
                ->where('restaurant_table_id', $lockedTable->id)
                ->where('status', 'open')
                ->lockForUpdate()
                ->first();

            if (! $session) {
                if ($lockedTable->status !== 'available') {
                    throw ValidationException::withMessages(['table' => 'La mesa no está disponible.']);
                }

                $session = TableSession::create([
                    'restaurant_table_id' => $lockedTable->id,
                    'waiter_id' => $waiter->id,
                    'customer_count' => $this->customerCountForFirstOrder($firstItem, $product, $quantity),
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
                $bill = Bill::query()->where('table_session_id', $session->id)->where('status', 'open')->lockForUpdate()->firstOrFail();
            }

            $order = null;
            foreach ($items as $itemData) {
                $quantity = (int) $itemData['quantity'];
                $product = isset($itemData['product_id']) ? Product::query()->with('menuCategory')->whereKey($itemData['product_id'])->first() : null;
                $order = Order::create(['bill_id' => $bill->id, 'user_id' => $waiter->id, 'status' => 'enviado_cocina']);
                $stock = $this->stockService->reserveStockForOrderItem($itemData, $quantity);
                $requiresKitchen = ($itemData['menu_modality_id'] ?? false) || $product?->menuCategory?->name === 'Comidas';
                $item = $order->items()->create(['product_id' => $itemData['product_id'] ?? null, 'menu_modality_id' => $itemData['menu_modality_id'] ?? null, 'quantity' => $quantity, 'notes' => $itemData['notes'] ?? null, 'unit_price' => $stock['unit_price'], 'subtotal' => $stock['subtotal'], 'kitchen_status' => $requiresKitchen ? 'pendiente' : 'entregado']);
                foreach ($stock['component_ids'] as $dailyMenuProductId) {
                    OrderItemMenuProduct::create(['order_item_id' => $item->id, 'daily_menu_product_id' => $dailyMenuProductId, 'quantity' => $quantity]);
                }
            }

            return $order;
        }, attempts: 3);
    }

    /** @param array<string, mixed> $data */
    private function customerCountForFirstOrder(array $data, ?Product $product, int $quantity): int
    {
        if (($data['menu_modality_id'] ?? null) !== null) {
            return $quantity;
        }

        if ($product?->menuSubcategory?->name === 'Platos Especiales') {
            return $quantity;
        }

        return max(1, (int) ($data['customer_count'] ?? 1));
    }
}
