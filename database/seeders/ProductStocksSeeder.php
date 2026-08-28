<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductStock;
use Illuminate\Database\Seeder;

class ProductStocksSeeder extends Seeder
{
    public function run(): void
    {
        $stocks = [
            30,
            25,
            40,
            20,
            35,
            50,
            15,
            45,
            60,
            25,
        ];

        Product::query()
            ->orderBy('id')
            ->limit(10)
            ->get()
            ->values()
            ->each(function (Product $product, int $index) use ($stocks) {
                ProductStock::updateOrCreate(
                    [
                        'product_id' => $product->id,
                    ],
                    [
                        'quantity' => $stocks[$index],
                    ]
                );
            });
    }
}
