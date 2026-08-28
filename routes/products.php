<?php

use App\Http\Controllers\Web\ProductController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('products', [ProductController::class, 'index'])
        ->name('products.index');

    Route::post('products', [ProductController::class, 'store'])
        ->name('products.store');

    Route::put('products/{product}', [ProductController::class, 'update'])
        ->name('products.update');

    Route::delete('products/{product}', [ProductController::class, 'destroy'])
        ->name('products.destroy');
    // Route::patch(
    //     'products/{product}/status',
    //     [ProductController::class, 'updateStatus']
    // )->name('products.status');
    Route::patch(
        '/products/{product}/status',
        [ProductController::class, 'updateStatus']
    )->name('products.update-status');
});
