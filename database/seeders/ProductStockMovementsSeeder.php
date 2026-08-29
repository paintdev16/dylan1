<?php

namespace Database\Seeders;

use App\Models\ProductStock;
use App\Models\StockMovement;
use Illuminate\Database\Seeder;

class ProductStockMovementsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ProductStock::query()->get()->each(function (ProductStock $stock): void {
            StockMovement::updateOrCreate(
                [
                    'product_id' => $stock->product_id,
                    'type' => 'stock_in',
                ],
                [
                    'quantity' => $stock->quantity,
                    'quantity_change' => $stock->quantity,
                    'previous_quantity' => 0,
                    'new_quantity' => $stock->quantity,
                    'description' => 'Carga de inventario inicial del restaurante.',
                ]
            );
        });
    }
}
