<?php

namespace Database\Seeders;

use App\Models\MenuSubcategory;
use App\Models\MenuSubcategoryType;
use Illuminate\Database\Seeder;

class MenuSubcategoryTypesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $menuEconomico = MenuSubcategory::where('code', 'economic_menu')
            ->whereHas('menuCategory', function ($query) {
                $query->where('code', 'food');
            })
            ->firstOrFail();

        $types = [
            [
                'menu_subcategory_id' => $menuEconomico->id,
                'code' => 'main_course',
                'name' => 'Segundos',
                'display_order' => 1,
                'active' => true,
            ],
            [
                'menu_subcategory_id' => $menuEconomico->id,
                'code' => 'starter',
                'name' => 'Entradas',
                'display_order' => 2,
                'active' => true,
            ],
            [
                'menu_subcategory_id' => $menuEconomico->id,
                'code' => 'dessert',
                'name' => 'Postres',
                'display_order' => 3,
                'active' => true,
            ],
        ];

        foreach ($types as $type) {
            MenuSubcategoryType::updateOrCreate(
                [
                    'menu_subcategory_id' => $type['menu_subcategory_id'],
                    'name' => $type['name'],
                ],
                $type
            );
        }
    }
}
