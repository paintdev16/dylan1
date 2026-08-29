<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Seeder;

class OrderItemsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $product = Product::query()->where('status', 'active')->firstOrFail();
        $orders = Order::query()->orderBy('id')->take(2)->get();

        foreach ($orders as $order) {
            OrderItem::updateOrCreate(
                ['order_id' => $order->id, 'product_id' => $product->id],
                [
                    'menu_modality_id' => null,
                    'quantity' => 2,
                    'notes' => 'Sin picante',
                    'unit_price' => $product->price,
                    'subtotal' => (float) $product->price * 2,
                    'kitchen_status' => 'pending',
                ]
            );
        }
    }
}
