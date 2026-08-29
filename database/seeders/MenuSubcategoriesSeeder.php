<?php

namespace Database\Seeders;

use App\Models\MenuCategory;
use App\Models\MenuSubcategory;
use Illuminate\Database\Seeder;

class MenuSubcategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $comidas = MenuCategory::where('code', 'food')
            ->firstOrFail();

        $subcategories = [
            [
                'menu_category_id' => $comidas->id,
                'name' => 'Menú Económico',
                'code' => 'economic_menu',
                'display_order' => 1,
                'active' => true,
            ],
            [
                'menu_category_id' => $comidas->id,
                'name' => 'Platos Especiales',
                'code' => 'special_dishes',
                'display_order' => 2,
                'active' => true,
            ],
        ];

        foreach ($subcategories as $subcategory) {
            MenuSubcategory::updateOrCreate(
                [
                    'menu_category_id' => $subcategory['menu_category_id'],
                    'code' => $subcategory['code'],
                ],
                $subcategory
            );
        }
    }
}
