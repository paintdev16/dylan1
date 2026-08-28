<?php

use App\Models\DailyMenu;
use App\Models\DailyMenuProduct;
use App\Models\MenuCategory;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function createProductForStockController(): Product
{
    $menuCategory = MenuCategory::create([
        'name' => 'Comidas',
        'display_order' => 0,
        'has_versions' => false,
        'active' => true,
    ]);

    return Product::create([
        'menu_category_id' => $menuCategory->id,
        'name' => 'Lomo saltado',
        'price' => 18.00,
        'type' => 'prepared',
        'status' => 'activo',
    ]);
}

test('authenticated users can register a stock entry', function () {
    $user = User::factory()->create();
    $product = createProductForStockController();

    $this->actingAs($user)
        ->post(route('products.stock.add', $product), [
            'quantity' => 12,
            'description' => 'Compra de insumos',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('product_stocks', [
        'product_id' => $product->id,
        'quantity' => 12,
    ]);

    $this->assertDatabaseHas('product_stock_movements', [
        'type' => 'entrada',
        'quantity_before' => 0,
        'quantity_after' => 12,
    ]);
});

test('stock removal returns a validation error when the quantity exceeds the balance', function () {
    $user = User::factory()->create();
    $product = createProductForStockController();

    $this->actingAs($user)->post(route('products.stock.add', $product), [
        'quantity' => 5,
    ]);

    $this->actingAs($user)
        ->from(route('products.index'))
        ->post(route('products.stock.remove', $product), [
            'quantity' => 6,
        ])
        ->assertRedirect(route('products.index'))
        ->assertSessionHasErrors('quantity');
});

test('authenticated users can adjust stock to an exact quantity', function () {
    $user = User::factory()->create();
    $product = createProductForStockController();

    $this->actingAs($user)
        ->post(route('products.stock.adjust', $product), [
            'quantity' => 7,
            'description' => 'Inventario físico',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('product_stock_movements', [
        'type' => 'ajuste',
        'quantity' => 7,
        'quantity_before' => 0,
        'quantity_after' => 7,
    ]);
});

test('products index provides the current stock for every product', function () {
    $user = User::factory()->create();
    $product = createProductForStockController();

    ProductStock::create([
        'product_id' => $product->id,
        'quantity' => 12,
    ]);

    $this->actingAs($user)
        ->get(route('products.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('products/index')
            ->where('products.0.product_stock.quantity', 12));
});

test('products index provides the current daily menu quantity for food products', function () {
    $user = User::factory()->create();
    $product = createProductForStockController();
    $dailyMenu = DailyMenu::create([
        'date' => today(),
        'active' => true,
    ]);

    DailyMenuProduct::create([
        'daily_menu_id' => $dailyMenu->id,
        'product_id' => $product->id,
        'price' => $product->price,
        'quantity_available' => 18,
        'display_order' => 1,
        'active' => true,
    ]);

    $this->actingAs($user)
        ->get(route('products.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('products/index')
            ->where('products.0.daily_menu_quantity', 18));
});

test('products index exposes whether a product is associated with a daily menu', function () {
    $user = User::factory()->create();
    $product = createProductForStockController();
    $dailyMenu = DailyMenu::create([
        'date' => today(),
        'active' => true,
    ]);

    DailyMenuProduct::create([
        'daily_menu_id' => $dailyMenu->id,
        'product_id' => $product->id,
        'price' => $product->price,
        'quantity_available' => 10,
        'display_order' => 1,
        'active' => true,
    ]);

    $this->actingAs($user)
        ->get(route('products.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('products/index')
            ->where('products.0.has_daily_menu_products', true));
});

test('creating a beverage registers its initial stock as an entry movement', function () {
    $user = User::factory()->create();
    $beverageCategory = MenuCategory::create([
        'name' => 'Bebidas',
        'display_order' => 0,
        'has_versions' => false,
        'active' => true,
    ]);

    $this->actingAs($user)
        ->post(route('products.store'), [
            'menu_category_id' => $beverageCategory->id,
            'name' => 'Inca Kola',
            'price' => 8.00,
            'type' => 'simple',
            'status' => 'activo',
            'initial_stock' => 24,
        ])
        ->assertRedirect(route('products.index'))
        ->assertSessionHas('success');

    $product = Product::where('name', 'Inca Kola')->firstOrFail();

    $this->assertDatabaseHas('product_stocks', [
        'product_id' => $product->id,
        'quantity' => 24,
    ]);

    $this->assertDatabaseHas('product_stock_movements', [
        'type' => 'entrada',
        'quantity' => 24,
        'quantity_before' => 0,
        'quantity_after' => 24,
        'description' => 'Stock inicial del producto.',
    ]);
});

test('products associated with a daily menu cannot be deleted', function () {
    $user = User::factory()->create();
    $product = createProductForStockController();
    $dailyMenu = DailyMenu::create([
        'date' => today(),
        'active' => true,
    ]);

    DailyMenuProduct::create([
        'daily_menu_id' => $dailyMenu->id,
        'product_id' => $product->id,
        'price' => $product->price,
        'quantity_available' => 10,
        'display_order' => 1,
        'active' => true,
    ]);

    $this->actingAs($user)
        ->from(route('products.index'))
        ->delete(route('products.destroy', $product))
        ->assertRedirect(route('products.index'))
        ->assertSessionHas(
            'error',
            'No se puede eliminar este producto porque ya tiene registros asociados en menús diarios.'
        );

    $this->assertModelExists($product);
});
