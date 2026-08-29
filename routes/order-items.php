<?php

use App\Http\Controllers\Web\CancellationRequestController;
use App\Http\Controllers\Web\OrderItemController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:super-admin|admin|mozo'])->group(function () {
    Route::get('orders/{order}/items', [OrderItemController::class, 'index'])
        ->name('orders.items.index');

    Route::post('orders/{order}/items', [OrderItemController::class, 'store'])
        ->name('orders.items.store');

    Route::post(
        'order-items/{orderItem}/cancel',
        [OrderItemController::class, 'cancel']
    )->name('order-items.cancel');
});

Route::middleware(['auth', 'role:super-admin|admin|mozo|cocina'])->patch(
    'order-items/{orderItem}/kitchen-status',
    [OrderItemController::class, 'updateKitchenStatus']
)->name('order-items.update-kitchen-status');

Route::middleware(['auth', 'role:super-admin|admin|cajero'])->patch(
    'cancellation-requests/{cancellationRequest}',
    [CancellationRequestController::class, 'review']
)->name('cancellation-requests.review');
