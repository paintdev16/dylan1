<?php

namespace App\Services;

use App\Models\Bill;
use App\Models\Order;
use App\Models\OrderItemMenuProduct;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderLifecycleService
{
    public function __construct(private readonly OrderStockService $stockService) {}

    /** @param array<string, mixed> $data */
    public function createForBill(Bill $bill, User $waiter, array $data): Order
    {
        if ($bill->status !== 'open') {
            throw ValidationException::withMessages(['bill_id' => ['No se pueden registrar pedidos en una cuenta cerrada.']]);
        }

        return DB::transaction(function () use ($bill, $waiter, $data): Order {
            $lockedBill = Bill::query()->lockForUpdate()->findOrFail($bill->id);

            if ($lockedBill->status !== 'open') {
                throw ValidationException::withMessages(['bill_id' => ['No se pueden registrar pedidos en una cuenta cerrada.']]);
            }

            $order = Order::create([
                'bill_id' => $lockedBill->id,
                'user_id' => $waiter->id,
                'status' => 'sent_to_kitchen',
            ]);
            $productId = $data['product_id'] ?? null;
            $menuModalityId = $data['menu_modality_id'] ?? null;

            if (! $productId && ! $menuModalityId) {
                return $order;
            }

            $quantity = (int) ($data['quantity'] ?? 1);
            $stockResult = $this->stockService->reserveStockForOrderItem($data, $quantity);
            $kitchenStatus = 'pending';

            if ($productId) {
                $product = Product::query()->with('menuCategory')->whereKey($productId)->first();
                $kitchenStatus = $product?->menuCategory?->code === 'beverages' ? 'delivered' : 'pending';
            }

            $orderItem = $order->items()->create([
                'product_id' => $productId,
                'menu_modality_id' => $menuModalityId,
                'daily_menu_product_id' => $stockResult['daily_menu_product_id'],
                'quantity' => $quantity,
                'notes' => $data['notes'] ?? null,
                'unit_price' => $stockResult['unit_price'],
                'subtotal' => $stockResult['subtotal'],
                'kitchen_status' => $kitchenStatus,
            ]);

            foreach ($stockResult['component_ids'] as $dailyMenuProductId) {
                OrderItemMenuProduct::create([
                    'order_item_id' => $orderItem->id,
                    'daily_menu_product_id' => $dailyMenuProductId,
                    'quantity' => $quantity,
                ]);
            }

            return $order;
        });
    }

    public function delete(Order $order): void
    {
        if ($order->items()->where('kitchen_status', '!=', 'pending')->exists()) {
            throw ValidationException::withMessages([
                'order' => ['No se puede eliminar una comanda cuyos productos ya están en preparación en cocina.'],
            ]);
        }

        DB::transaction(function () use ($order): void {
            $order->load('items');

            foreach ($order->items as $item) {
                $this->stockService->restoreStockForOrderItem($item);
            }

            $order->delete();
        });
    }
}
