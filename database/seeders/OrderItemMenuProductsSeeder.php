<?php

namespace Database\Seeders;

use App\Models\DailyMenuProduct;
use App\Models\OrderItem;
use App\Models\OrderItemMenuProduct;
use Illuminate\Database\Seeder;

class OrderItemMenuProductsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $orderItemWithMenu = OrderItem::query()
            ->whereNotNull('menu_modality_id')
            ->first();

        $dailyMenuProducts = DailyMenuProduct::query()
            ->where('active', true)
            ->take(3)
            ->get();

        if ($orderItemWithMenu && $dailyMenuProducts->isNotEmpty()) {
            foreach ($dailyMenuProducts as $dailyMenuProduct) {
                OrderItemMenuProduct::updateOrCreate(
                    [
                        'order_item_id' => $orderItemWithMenu->id,
                        'daily_menu_product_id' => $dailyMenuProduct->id,
                    ],
                    [
                        'quantity' => 1,
                    ]
                );
            }
        }
    }
}
