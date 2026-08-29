<?php

use App\Http\Controllers\Web\RestaurantTableController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:super-admin|admin'])->group(function () {
    Route::get('tables', [RestaurantTableController::class, 'index'])
        ->name('tables.index');

    Route::post('tables', [RestaurantTableController::class, 'store'])
        ->name('tables.store');

    Route::put('tables/{table}', [RestaurantTableController::class, 'update'])
        ->name('tables.update');

    Route::patch(
        'tables/{table}/status',
        [RestaurantTableController::class, 'updateStatus']
    )->name('tables.status');

});
