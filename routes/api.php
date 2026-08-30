<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->name('api.auth.')->group(function () {
    Route::post('login', [AuthController::class, 'login'])
        ->middleware('throttle:api-login')
        ->name('login');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me'])->name('me');
        Route::post('logout', [AuthController::class, 'logout'])->name('logout');
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('profile', [ProfileController::class, 'show'])->name('api.profile.show');
    Route::patch('profile', [ProfileController::class, 'update'])->name('api.profile.update');
    Route::delete('profile', [ProfileController::class, 'destroy'])->name('api.profile.destroy');

    Route::get('dashboard', DashboardController::class)->name('api.dashboard');

    Route::middleware('role:super-admin|admin|mozo')->group(function () {
        Route::get('orders', [OrderController::class, 'index'])->name('api.orders.index');
        Route::post('orders', [OrderController::class, 'store'])->name('api.orders.store');
        Route::post('orders/tables/{table}', [OrderController::class, 'storeForTable'])->name('api.orders.tables.store');
        Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus'])->name('api.orders.update-status');
        Route::delete('orders/{order}', [OrderController::class, 'destroy'])->name('api.orders.destroy');
    });
});
