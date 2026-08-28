<?php

namespace Database\Seeders;

use App\Models\MenuModality;
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
        $order = Order::query()->orderBy('id')->firstOrFail();
        $product = Product::query()->where('status', 'activo')->firstOrFail();
        $menuModality = MenuModality::query()->where('active', true)->firstOrFail();

        OrderItem::updateOrCreate(
            [
                'order_id' => $order->id,
                'product_id' => $product->id,
            ],
            [
                'menu_modality_id' => null,
                'quantity' => 2,
                'notes' => 'Sin picante',
                'unit_price' => $product->price,
                'subtotal' => (float) $product->price * 2,
                'kitchen_status' => 'pendiente',
            ]
        );

        OrderItem::updateOrCreate(
            [
                'order_id' => $order->id,
                'menu_modality_id' => $menuModality->id,
            ],
            [
                'product_id' => null,
                'quantity' => 1,
                'notes' => null,
                'unit_price' => $menuModality->price,
                'subtotal' => $menuModality->price,
                'kitchen_status' => 'en_preparacion',
            ]
        );
    }
}
