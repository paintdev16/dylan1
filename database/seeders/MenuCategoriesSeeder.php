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
                'display_order' => 1,
                'active' => true,
            ],
            [
                'name' => 'Bebidas',
                'display_order' => 2,
                'active' => true,
            ],
        ];

        foreach ($categories as $category) {
            MenuCategory::updateOrCreate(
                ['name' => $category['name']],
                $category
            );
        }
    }
}
