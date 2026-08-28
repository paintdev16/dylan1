<?php

use App\Models\MenuSubcategory;
use App\Models\Product;
use Database\Seeders\MenuCategoriesSeeder;
use Database\Seeders\MenuSubcategoriesSeeder;
use Database\Seeders\MenuSubcategoryTypesSeeder;
use Database\Seeders\ProductsSeeder;

test('products seeder assigns a type to every economic menu product', function () {
    $this->seed([
        MenuCategoriesSeeder::class,
        MenuSubcategoriesSeeder::class,
        MenuSubcategoryTypesSeeder::class,
        ProductsSeeder::class,
    ]);

    $menuEconomico = MenuSubcategory::where('name', 'Menú Económico')
        ->firstOrFail();

    $productsWithoutType = Product::whereBelongsTo(
        $menuEconomico,
        'menuSubcategory'
    )
        ->whereNull('menu_subcategory_type_id')
        ->count();

    expect($productsWithoutType)->toBe(0);
});
