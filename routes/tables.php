<?php

use App\Http\Controllers\Web\RestaurantTableController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('tables', [RestaurantTableController::class, 'index'])
        ->name('tables.index');

    Route::post('tables', [RestaurantTableController::class, 'store'])
        ->name('tables.store');

    Route::put('tables/{table}', [RestaurantTableController::class, 'update'])
        ->name('tables.update');

    Route::delete('tables/{table}', [RestaurantTableController::class, 'destroy'])
        ->name('tables.destroy');
    Route::patch(
        'tables/{table}/status',
        [RestaurantTableController::class, 'updateStatus']
    )->name('tables.status');

    Route::post(
        'tables/{table}/open-session',
        [RestaurantTableController::class, 'openSession']
    )->name('tables.open-session');
});
