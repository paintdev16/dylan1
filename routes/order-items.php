<?php

use App\Http\Controllers\Web\OrderItemController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('orders/{order}/items', [OrderItemController::class, 'index'])
        ->name('orders.items.index');

    Route::post('orders/{order}/items', [OrderItemController::class, 'store'])
        ->name('orders.items.store');

    Route::patch(
        'order-items/{orderItem}/kitchen-status',
        [OrderItemController::class, 'updateKitchenStatus']
    )->name('order-items.update-kitchen-status');

    Route::delete(
        'order-items/{orderItem}',
        [OrderItemController::class, 'destroy']
    )->name('order-items.destroy');
});
