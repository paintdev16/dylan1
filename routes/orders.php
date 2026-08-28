<?php

use App\Http\Controllers\Web\OrderController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('orders', [OrderController::class, 'index'])
        ->name('orders.index');

    Route::post('orders', [OrderController::class, 'store'])
        ->name('orders.store');

    Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus'])
        ->name('orders.update-status');

    Route::delete('orders/{order}', [OrderController::class, 'destroy'])
        ->name('orders.destroy');
});
