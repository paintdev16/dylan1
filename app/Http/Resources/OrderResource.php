<?php

namespace App\Http\Resources;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use LogicException;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        if (! $this->resource instanceof Order) {
            throw new LogicException('OrderResource requires an Order model.');
        }

        $order = $this->resource;

        return [
            'id' => $order->id,
            'status' => $order->status,
            'request_token' => $order->request_token,
            'created_at' => $order->created_at,
            'updated_at' => $order->updated_at,
            'waiter' => $this->when($order->relationLoaded('user'), fn () => [
                'id' => $order->user->id,
                'name' => $order->user->name,
            ]),
            'bill' => $this->when($order->relationLoaded('bill'), fn () => [
                'id' => $order->bill->id,
                'status' => $order->bill->status,
                'total_amount' => $order->bill->total_amount,
                'paid_amount' => $order->bill->paid_amount,
                'balance' => $order->bill->balance,
                'table' => $order->bill->restaurantTable
                    ? ['id' => $order->bill->restaurantTable->id, 'number' => $order->bill->restaurantTable->number]
                    : null,
            ]),
            'items' => $this->when($order->relationLoaded('items'), fn () => $order->items->map(fn ($item) => [
                'id' => $item->id,
                'product' => $item->product
                    ? ['id' => $item->product->id, 'name' => $item->product->name]
                    : null,
                'menu_modality' => $item->menuModality
                    ? ['id' => $item->menuModality->id, 'name' => $item->menuModality->name]
                    : null,
                'components' => $item->orderItemMenuProducts->map(fn ($component) => [
                    'id' => $component->dailyMenuProduct->id,
                    'product_id' => $component->dailyMenuProduct->product_id,
                    'name' => $component->dailyMenuProduct->product?->name,
                    'quantity' => $component->quantity,
                ])->values()->all(),
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'subtotal' => $item->subtotal,
                'notes' => $item->notes,
                'kitchen_status' => $item->kitchen_status,
                'is_cancelled' => $item->is_cancelled,
            ])->values()->all()),
        ];
    }
}
