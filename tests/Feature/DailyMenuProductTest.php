<?php

use App\Models\DailyMenu;
use App\Models\DailyMenuProduct;
use App\Models\MenuCategory;
use App\Models\MenuSubcategory;
use App\Models\MenuSubcategoryType;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

function createDailyMenuProduct(): DailyMenuProduct
{
    $menuCategory = MenuCategory::create([
        'name' => 'Comidas',
        'display_order' => 0,
        'has_versions' => false,
        'active' => true,
    ]);

    $menuSubcategory = MenuSubcategory::create([
        'menu_category_id' => $menuCategory->id,
        'name' => 'Carta',
        'display_order' => 0,
        'active' => true,
    ]);

    $product = Product::create([
        'menu_category_id' => $menuCategory->id,
        'menu_subcategory_id' => $menuSubcategory->id,
        'name' => 'Arroz con pollo',
        'price' => 15.00,
        'type' => 'prepared',
        'status' => 'active',
    ]);

    $dailyMenu = DailyMenu::create([
        'date' => today(),
        'active' => true,
    ]);

    return DailyMenuProduct::create([
        'daily_menu_id' => $dailyMenu->id,
        'product_id' => $product->id,
        'price' => 15.00,
        'quantity_available' => 10,
        'display_order' => 1,
        'active' => true,
    ]);
}

test('authenticated users can update a daily menu product', function () {
    $dailyMenuProduct = createDailyMenuProduct();
    $user = User::factory()->create();

    $response = $this->actingAs($user)->put(
        route('daily-menu-products.update', $dailyMenuProduct),
        [
            'product_id' => $dailyMenuProduct->product_id,
            'menu_subcategory_id' => $dailyMenuProduct->product->menu_subcategory_id,
            'menu_subcategory_type_id' => null,
            'price' => 18.50,
            'quantity_available' => 25,
            'display_order' => 2,
            'active' => false,
        ]
    );

    $response->assertRedirect(route('daily-menu-products.index'));

    $this->assertDatabaseHas('daily_menu_products', [
        'id' => $dailyMenuProduct->id,
        'price' => 18.50,
        'quantity_available' => 25,
        'display_order' => 2,
        'active' => false,
    ]);
});

test('authenticated users can update a daily menu product status', function () {
    $dailyMenuProduct = createDailyMenuProduct();
    $user = User::factory()->create();

    $response = $this->actingAs($user)->patch(
        route('daily-menu-products.update-status', $dailyMenuProduct),
        ['active' => false]
    );

    $response->assertRedirect();

    $this->assertDatabaseHas('daily_menu_products', [
        'id' => $dailyMenuProduct->id,
        'active' => false,
    ]);
});

test('daily menu products page provides active products for the selected menu type', function () {
    $user = User::factory()->create();

    $menuCategory = MenuCategory::create([
        'name' => 'Comidas',
        'display_order' => 0,
        'has_versions' => false,
        'active' => true,
    ]);

    $menuSubcategory = MenuSubcategory::create([
        'menu_category_id' => $menuCategory->id,
        'name' => 'Menú Económico',
        'display_order' => 0,
        'active' => true,
    ]);

    $menuSubcategoryType = MenuSubcategoryType::create([
        'menu_subcategory_id' => $menuSubcategory->id,
        'name' => 'Segundos',
        'display_order' => 0,
        'active' => true,
    ]);

    $product = Product::create([
        'menu_category_id' => $menuCategory->id,
        'menu_subcategory_id' => $menuSubcategory->id,
        'menu_subcategory_type_id' => $menuSubcategoryType->id,
        'name' => 'Lomo saltado',
        'price' => 18.00,
        'type' => 'prepared',
        'status' => 'active',
    ]);

    $this->actingAs($user)
        ->get(route('daily-menu-products.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('daily-menu-products/index')
            ->has('products', 1)
            ->where('products.0.id', $product->id));
});

test('daily menu products use the current date in Peru', function () {
    Carbon::setTestNow(Carbon::create(2026, 8, 28, 3, 30, 0, 'UTC'));

    try {
        $this->actingAs(User::factory()->create())
            ->get(route('daily-menu-products.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('dailyMenu.formatted_date', '27/08/2026'));
    } finally {
        Carbon::setTestNow();
    }
});

test('updating a second synchronizes the quantities of entries and desserts', function () {
    $user = User::factory()->create();

    $menuCategory = MenuCategory::create([
        'name' => 'Comidas',
        'display_order' => 0,
        'has_versions' => false,
        'active' => true,
    ]);

    $menuSubcategory = MenuSubcategory::create([
        'menu_category_id' => $menuCategory->id,
        'name' => 'Menú Económico',
        'display_order' => 0,
        'active' => true,
    ]);

    $segundos = MenuSubcategoryType::create([
        'menu_subcategory_id' => $menuSubcategory->id,
        'name' => 'Segundos',
        'display_order' => 0,
        'active' => true,
    ]);

    $entradas = MenuSubcategoryType::create([
        'menu_subcategory_id' => $menuSubcategory->id,
        'name' => 'Entradas',
        'display_order' => 1,
        'active' => true,
    ]);

    $postres = MenuSubcategoryType::create([
        'menu_subcategory_id' => $menuSubcategory->id,
        'name' => 'Postres',
        'display_order' => 2,
        'active' => true,
    ]);

    $secondProduct = Product::create([
        'menu_category_id' => $menuCategory->id,
        'menu_subcategory_id' => $menuSubcategory->id,
        'menu_subcategory_type_id' => $segundos->id,
        'name' => 'Lomo saltado',
        'price' => 18.00,
        'type' => 'prepared',
        'status' => 'active',
    ]);

    $otherSecondProduct = Product::create([
        'menu_category_id' => $menuCategory->id,
        'menu_subcategory_id' => $menuSubcategory->id,
        'menu_subcategory_type_id' => $segundos->id,
        'name' => 'Pollo a la plancha',
        'price' => 16.00,
        'type' => 'prepared',
        'status' => 'active',
    ]);

    $entryProduct = Product::create([
        'menu_category_id' => $menuCategory->id,
        'menu_subcategory_id' => $menuSubcategory->id,
        'menu_subcategory_type_id' => $entradas->id,
        'name' => 'Causa rellena',
        'price' => 4.00,
        'type' => 'prepared',
        'status' => 'active',
    ]);

    $dessertProduct = Product::create([
        'menu_category_id' => $menuCategory->id,
        'menu_subcategory_id' => $menuSubcategory->id,
        'menu_subcategory_type_id' => $postres->id,
        'name' => 'Mazamorra morada',
        'price' => 3.00,
        'type' => 'prepared',
        'status' => 'active',
    ]);

    $dailyMenu = DailyMenu::create([
        'date' => today(),
        'active' => true,
    ]);

    $dailyMenuSecond = DailyMenuProduct::create([
        'daily_menu_id' => $dailyMenu->id,
        'product_id' => $secondProduct->id,
        'price' => 18.00,
        'quantity_available' => 20,
        'display_order' => 1,
        'active' => true,
    ]);

    DailyMenuProduct::create([
        'daily_menu_id' => $dailyMenu->id,
        'product_id' => $otherSecondProduct->id,
        'price' => 16.00,
        'quantity_available' => 10,
        'display_order' => 2,
        'active' => true,
    ]);

    $dailyMenuEntry = DailyMenuProduct::create([
        'daily_menu_id' => $dailyMenu->id,
        'product_id' => $entryProduct->id,
        'price' => 4.00,
        'quantity_available' => 1,
        'display_order' => 3,
        'active' => true,
    ]);

    $dailyMenuDessert = DailyMenuProduct::create([
        'daily_menu_id' => $dailyMenu->id,
        'product_id' => $dessertProduct->id,
        'price' => 3.00,
        'quantity_available' => 1,
        'display_order' => 4,
        'active' => true,
    ]);

    $this->actingAs($user)
        ->put(route('daily-menu-products.update', $dailyMenuSecond), [
            'product_id' => $secondProduct->id,
            'menu_subcategory_id' => $menuSubcategory->id,
            'menu_subcategory_type_id' => $segundos->id,
            'price' => 18.00,
            'quantity_available' => 25,
            'display_order' => 1,
            'active' => true,
        ])
        ->assertRedirect(route('daily-menu-products.index'));

    $this->assertDatabaseHas('daily_menu_products', [
        'id' => $dailyMenuEntry->id,
        'quantity_available' => 35,
    ]);

    $this->assertDatabaseHas('daily_menu_products', [
        'id' => $dailyMenuDessert->id,
        'quantity_available' => 35,
    ]);
});

test('today menu is created automatically as draft on first visit', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('daily-menu-products.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('daily-menu-products/index')
            ->where('dailyMenu.active', false)
        );

    $menu = DailyMenu::first();
    expect($menu)->not->toBeNull()
        ->and($menu->date->toDateString())->toBe(now('America/Lima')->toDateString())
        ->and($menu->active)->toBeFalse();
});

test('authenticated user can toggle whole daily menu active status', function () {
    $user = User::factory()->create();
    $dailyMenu = DailyMenu::create([
        'date' => now('America/Lima')->toDateString(),
        'active' => false,
    ]);

    $this->actingAs($user)
        ->patch(route('daily-menus.update-status', $dailyMenu), [
            'active' => true,
        ])
        ->assertRedirect();

    expect($dailyMenu->fresh()->active)->toBeTrue();

    $this->actingAs($user)
        ->patch(route('daily-menus.update-status', $dailyMenu), [
            'active' => false,
        ])
        ->assertRedirect();

    expect($dailyMenu->fresh()->active)->toBeFalse();
});

test('cannot add the same product twice to a daily menu', function () {
    $user = User::factory()->create();
    $dailyMenuProduct = createDailyMenuProduct();

    $this->actingAs($user)
        ->post(route('daily-menu-products.store'), [
            'daily_menu_id' => $dailyMenuProduct->daily_menu_id,
            'product_id' => $dailyMenuProduct->product_id,
            'menu_subcategory_id' => $dailyMenuProduct->product->menu_subcategory_id,
            'price' => 15.00,
            'quantity_available' => 10,
            'display_order' => 2,
            'active' => true,
        ])
        ->assertSessionHasErrors('product_id');
});

test('past daily menus cannot be modified or activated', function () {
    $user = User::factory()->create();
    $pastDate = now('America/Lima')->subDays(2)->toDateString();

    $pastMenu = DailyMenu::create([
        'date' => $pastDate,
        'active' => false,
    ]);

    $category = MenuCategory::create(['name' => 'Comidas', 'display_order' => 1, 'active' => true]);
    $sub = MenuSubcategory::create(['menu_category_id' => $category->id, 'name' => 'Platos Especiales', 'display_order' => 1, 'active' => true]);
    $product = Product::create([
        'menu_category_id' => $category->id,
        'menu_subcategory_id' => $sub->id,
        'name' => 'Plato Pasado',
        'type' => 'prepared',
        'status' => 'active',
        'price' => 20.00,
    ]);

    $pastItem = DailyMenuProduct::create([
        'daily_menu_id' => $pastMenu->id,
        'product_id' => $product->id,
        'price' => 20.00,
        'quantity_available' => 5,
        'display_order' => 1,
        'active' => false,
    ]);

    // Intentar activar menú pasado
    $this->actingAs($user)
        ->patch(route('daily-menus.update-status', $pastMenu), ['active' => true])
        ->assertSessionHasErrors('daily_menu');

    // Intentar modificar ítem de menú pasado
    $this->actingAs($user)
        ->put(route('daily-menu-products.update', $pastItem), [
            'product_id' => $product->id,
            'menu_subcategory_id' => $sub->id,
            'price' => 25.00,
            'quantity_available' => 10,
            'display_order' => 1,
            'active' => true,
        ])
        ->assertSessionHasErrors('daily_menu');

    // Intentar eliminar ítem de menú pasado
    $this->actingAs($user)
        ->delete(route('daily-menu-products.destroy', $pastItem))
        ->assertSessionHasErrors('daily_menu');
});
