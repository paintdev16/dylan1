<?php

namespace Database\Seeders;

use App\Models\DailyMenu;
use App\Models\MenuModality;
use Illuminate\Database\Seeder;

class MenuModalitiesSeeder extends Seeder
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
        | Modalidades del Menú Económico
        |--------------------------------------------------------------------------
        |
        | Estas son las modalidades comerciales disponibles:
        |
        | - Menú completo: segundo + entrada + postre
        | - Solo segundo: segundo
        | - Entrada + postre: entrada + postre
        |
        */

        $modalities = [
            [
                'code' => 'full_menu',
                'name' => 'Menú completo',
                'description' => 'Segundo + entrada + postre.',
                'price' => 14.00,
                'display_order' => 1,
                'active' => true,
            ],

            [
                'code' => 'main_only',
                'name' => 'Solo segundo',
                'description' => 'Solo segundo del menú económico.',
                'price' => 9.00,
                'display_order' => 2,
                'active' => true,
            ],

            [
                'code' => 'starter_dessert',
                'name' => 'Entrada + postre',
                'description' => 'Una entrada + un postre.',
                'price' => 5.00,
                'display_order' => 3,
                'active' => true,
            ],
        ];

        /*
        |--------------------------------------------------------------------------
        | Crear / actualizar
        |--------------------------------------------------------------------------
        */

        foreach ($modalities as $modality) {
            MenuModality::updateOrCreate(
                [
                    'daily_menu_id' => $dailyMenu->id,
                    'code' => $modality['code'],
                ],
                [
                    'name' => $modality['name'],
                    'description' => $modality['description'],
                    'price' => $modality['price'],
                    'display_order' => $modality['display_order'],
                    'active' => $modality['active'],
                ]
            );
        }
    }
}
