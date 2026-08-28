<?php

use App\Http\Controllers\DailyMenuProductController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('daily-menu-products', [DailyMenuProductController::class, 'index'])
        ->name('daily-menu-products.index');

    Route::post('daily-menu-products', [DailyMenuProductController::class, 'store'])
        ->name('daily-menu-products.store');

    Route::put('daily-menu-products/{dailyMenuProduct}', [DailyMenuProductController::class, 'update'])
        ->name('daily-menu-products.update');

    Route::delete('daily-menu-products/{dailyMenuProduct}', [DailyMenuProductController::class, 'destroy'])
        ->name('daily-menu-products.destroy');

    Route::patch(
        'daily-menu-products/{dailyMenuProduct}/status',
        [DailyMenuProductController::class, 'updateStatus']
    )->name('daily-menu-products.update-status');
});
