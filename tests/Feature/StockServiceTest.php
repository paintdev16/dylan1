<?php

use App\Models\MenuCategory;
use App\Models\Product;
use App\Models\StockMovement;
use App\Services\StockService;
use Database\Seeders\ProductStockMovementsSeeder;
use InvalidArgumentException;

function createStockProduct(): Product
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
        'status' => 'active',
    ]);
}

test('initial stock movement seeder records the signed quantity change', function () {
    $product = createStockProduct();

    $product->productStock()->create(['quantity' => 30]);

    $this->seed(ProductStockMovementsSeeder::class);

    $movement = StockMovement::query()
        ->whereBelongsTo($product)
        ->where('type', 'stock_in')
        ->firstOrFail();

    expect($movement->quantity)->toBe(30)
        ->and($movement->quantity_change)->toBe(30)
        ->and($movement->previous_quantity)->toBe(0)
        ->and($movement->new_quantity)->toBe(30);
});

test('adds stock and records the resulting movement', function () {
    $product = createStockProduct();

    $movement = app(StockService::class)->add(
        $product,
        10,
        'Compra de insumos'
    );

    expect($product->fresh('productStock')->productStock->quantity)->toBe(10);

    $this->assertDatabaseHas('stock_movements', [
        'id' => $movement->id,
        'type' => 'stock_in',
        'quantity' => 10,
        'previous_quantity' => 0,
        'new_quantity' => 10,
        'description' => 'Compra de insumos',
    ]);
});

test('removes stock and prevents quantities below zero', function () {
    $product = createStockProduct();
    $stockService = app(StockService::class);

    $stockService->add($product, 10);
    $movement = $stockService->remove($product, 4, 'Venta');

    expect($product->fresh('productStock')->productStock->quantity)->toBe(6);

    $this->assertDatabaseHas('stock_movements', [
        'id' => $movement->id,
        'type' => 'sale',
        'quantity' => 4,
        'previous_quantity' => 10,
        'new_quantity' => 6,
    ]);

    expect(fn () => $stockService->remove($product, 7))
        ->toThrow(InvalidArgumentException::class);
});

test('adjusts stock and preserves the before and after quantities', function () {
    $product = createStockProduct();
    $stockService = app(StockService::class);

    $stockService->add($product, 10);
    $movement = $stockService->adjust($product, 7, 'Inventario físico');

    expect($product->fresh('productStock')->productStock->quantity)->toBe(7);

    $this->assertDatabaseHas('stock_movements', [
        'id' => $movement->id,
        'type' => 'adjustment',
        'quantity' => 3,
        'previous_quantity' => 10,
        'new_quantity' => 7,
        'description' => 'Inventario físico',
    ]);
});

test('keeps the catalog product active when its stock reaches zero', function () {
    $product = createStockProduct();
    $stockService = app(StockService::class);

    $stockService->add($product, 10);
    $stockService->adjust($product, 0, 'Inventario físico');

    expect($product->fresh()->status)->toBe('active');
});
