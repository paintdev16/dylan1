<?php

use App\Http\Controllers\Web\DailyMenuController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('daily-menus', [DailyMenuController::class, 'index'])
        ->name('daily-menus.index');

    Route::post('daily-menus', [DailyMenuController::class, 'store'])
        ->name('daily-menus.store');

    Route::put('daily-menus/{dailyMenu}', [DailyMenuController::class, 'update'])
        ->name('daily-menus.update');

    Route::delete('daily-menus/{dailyMenu}', [DailyMenuController::class, 'destroy'])
        ->name('daily-menus.destroy');
    // Route::patch(
    //     'menu-categories/{menuCategory}/status',
    //     [MenuCategoryController::class, 'updateStatus']
    // )->name('menu-categories.status');
});
