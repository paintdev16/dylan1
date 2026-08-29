<?php

namespace Database\Seeders;

use App\Models\MenuCategory;
use Illuminate\Database\Seeder;

class MenuCategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Comidas',
                'code' => 'food',
                'display_order' => 1,
                'active' => true,
            ],
            [
                'name' => 'Bebidas',
                'code' => 'beverages',
                'display_order' => 2,
                'active' => true,
            ],
        ];

        foreach ($categories as $category) {
            MenuCategory::updateOrCreate(
                ['code' => $category['code']],
                $category
            );
        }
    }
}
