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

    Route::patch(
        'daily-menus/{dailyMenu}/status',
        [DailyMenuProductController::class, 'updateMenuStatus']
    )->name('daily-menus.update-status');

    Route::put(
        'daily-menu-modalities/{menuModality}',
        [DailyMenuProductController::class, 'updateModality']
    )->name('daily-menu-modalities.update');

    Route::get('daily-menu', [DailyMenuProductController::class, 'index'])
        ->name('daily-menu.index');
});
