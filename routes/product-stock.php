<?php

use App\Http\Controllers\Web\ProductStockController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:super-admin|admin'])->group(function () {
    Route::post('products/{product}/stock/add', [ProductStockController::class, 'add'])
        ->name('products.stock.add');

    Route::post('products/{product}/stock/remove', [ProductStockController::class, 'remove'])
        ->name('products.stock.remove');

    Route::post('products/{product}/stock/adjust', [ProductStockController::class, 'adjust'])
        ->name('products.stock.adjust');
});
