<?php

use App\Http\Controllers\Web\MenuCategoryController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:super-admin|admin'])->group(function () {
    Route::get('menu-categories', [MenuCategoryController::class, 'index'])
        ->name('menu-categories.index');

    Route::post('menu-categories', [MenuCategoryController::class, 'store'])
        ->name('menu-categories.store');

    Route::put('menu-categories/{menuCategory}', [MenuCategoryController::class, 'update'])
        ->name('menu-categories.update');

    Route::delete('menu-categories/{menuCategory}', [MenuCategoryController::class, 'destroy'])
        ->name('menu-categories.destroy');
    // Route::patch(
    //     'menu-categories/{menuCategory}/status',
    //     [MenuCategoryController::class, 'updateStatus']
    // )->name('menu-categories.status');
});
