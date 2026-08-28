<?php

namespace Database\Seeders;

use App\Models\ProductStock;
use App\Models\ProductStockMovement;
use Illuminate\Database\Seeder;

class ProductStockMovementsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ProductStock::query()->get()->each(function (ProductStock $stock): void {
            ProductStockMovement::updateOrCreate(
                [
                    'product_stock_id' => $stock->id,
                    'type' => 'entrada',
                ],
                [
                    'quantity' => $stock->quantity,
                    'quantity_before' => 0,
                    'quantity_after' => $stock->quantity,
                    'description' => 'Carga de inventario inicial del restaurante.',
                ]
            );
        });
    }
}
