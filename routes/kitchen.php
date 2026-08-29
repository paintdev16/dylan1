<?php

use App\Http\Controllers\Web\KitchenController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:super-admin|admin|cocina'])->group(function () {
    Route::get('kitchen', [KitchenController::class, 'index'])
        ->name('kitchen.index');

    Route::patch('kitchen/items/{orderItem}/status', [KitchenController::class, 'updateItemStatus'])
        ->name('kitchen.items.update-status');
});
