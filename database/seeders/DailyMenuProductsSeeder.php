<?php

namespace Database\Seeders;

use App\Models\DailyMenu;
use App\Models\DailyMenuProduct;
use App\Models\Product;
use Illuminate\Database\Seeder;

class DailyMenuProductsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Menú del día
        |--------------------------------------------------------------------------
        |
        | Solo existe un DailyMenu por fecha.
        |
        */

        $dailyMenu = DailyMenu::firstOrCreate(
            [
                'date' => today(),
            ],
            [
                'active' => true,
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Productos que estarán disponibles hoy
        |--------------------------------------------------------------------------
        |
        | Los productos se especifican manualmente.
        | No se seleccionan aleatoriamente.
        |
        */

        $items = [
            [
                'product' => 'Ají de Gallina',
                'price' => 7.00,
                'quantity_available' => 50,
                'display_order' => 1,
            ],

            [
                'product' => 'Seco de Pollo',
                'price' => 7.00,
                'quantity_available' => 50,
                'display_order' => 2,
            ],

            [
                'product' => 'Causa Rellena',
                'price' => 4.00,
                'quantity_available' => 30,
                'display_order' => 3,
            ],

            [
                'product' => 'Lomo Saltado',
                'price' => 18.00,
                'quantity_available' => 30,
                'display_order' => 4,
            ],

            [
                'product' => 'Arroz con Leche',
                'price' => 3.00,
                'quantity_available' => 20,
                'display_order' => 5,
            ],
        ];

        /*
        |--------------------------------------------------------------------------
        | Publicar productos en el menú del día
        |--------------------------------------------------------------------------
        */

        foreach ($items as $item) {
            $product = Product::with([
                'menuCategory',
                'menuSubcategory',
            ])
                ->where('name', $item['product'])
                ->where('status', 'active')
                ->whereHas('menuCategory', function ($query) {
                    $query->where('code', 'food');
                })
                ->first();

            /*
            |--------------------------------------------------------------------------
            | Producto no encontrado
            |--------------------------------------------------------------------------
            */

            if (! $product) {
                $this->command->warn(
                    "Producto no encontrado: {$item['product']}"
                );

                continue;
            }

            /*
            |--------------------------------------------------------------------------
            | Crear / actualizar
            |--------------------------------------------------------------------------
            |
            | Un producto solo puede aparecer una vez
            | en el menú de una determinada fecha.
            |
            */

            DailyMenuProduct::updateOrCreate(
                [
                    'daily_menu_id' => $dailyMenu->id,
                    'product_id' => $product->id,
                ],
                [
                    'price' => $item['price'],
                    'quantity_available' => $item['quantity_available'],
                    'display_order' => $item['display_order'],
                    'active' => true,
                ]
            );
        }
    }
}
