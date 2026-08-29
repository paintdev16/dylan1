<?php

use App\Http\Controllers\Web\OrderController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:super-admin|admin|mozo'])->group(function () {
    Route::get('orders', [OrderController::class, 'index'])
        ->name('orders.index');

    Route::post('orders/tables/{table}', [OrderController::class, 'storeForTable'])
        ->name('orders.tables.store');

    Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus'])
        ->name('orders.update-status');

});
