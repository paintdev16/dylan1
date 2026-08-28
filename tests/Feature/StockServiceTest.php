<?php

use App\Models\MenuCategory;
use App\Models\Product;
use App\Services\StockService;
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
        'status' => 'activo',
    ]);
}

test('adds stock and records the resulting movement', function () {
    $product = createStockProduct();

    $movement = app(StockService::class)->add(
        $product,
        10,
        'Compra de insumos'
    );

    expect($product->fresh('productStock')->productStock->quantity)->toBe(10);

    $this->assertDatabaseHas('product_stock_movements', [
        'id' => $movement->id,
        'type' => 'entrada',
        'quantity' => 10,
        'quantity_before' => 0,
        'quantity_after' => 10,
        'description' => 'Compra de insumos',
    ]);
});

test('removes stock and prevents quantities below zero', function () {
    $product = createStockProduct();
    $stockService = app(StockService::class);

    $stockService->add($product, 10);
    $movement = $stockService->remove($product, 4, 'Venta');

    expect($product->fresh('productStock')->productStock->quantity)->toBe(6);

    $this->assertDatabaseHas('product_stock_movements', [
        'id' => $movement->id,
        'type' => 'salida',
        'quantity' => 4,
        'quantity_before' => 10,
        'quantity_after' => 6,
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

    $this->assertDatabaseHas('product_stock_movements', [
        'id' => $movement->id,
        'type' => 'ajuste',
        'quantity' => 3,
        'quantity_before' => 10,
        'quantity_after' => 7,
        'description' => 'Inventario físico',
    ]);
});

test('deactivates a product when its stock reaches zero', function () {
    $product = createStockProduct();
    $stockService = app(StockService::class);

    $stockService->add($product, 10);
    $stockService->adjust($product, 0, 'Inventario físico');

    expect($product->fresh()->status)->toBe('inactivo');
});
