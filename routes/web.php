<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\Web\DashboardController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::middleware('role:super-admin|admin')->group(function () {
        Route::get('users', [UserController::class, 'index'])->middleware('permission:view users')->name('users.index');
        Route::post('users', [UserController::class, 'store'])->middleware('permission:create users')->name('users.store');
        Route::match(['put', 'patch'], 'users/{user}', [UserController::class, 'update'])->middleware('permission:edit users')->name('users.update');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->middleware('permission:delete users')->name('users.destroy');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/tables.php';
require __DIR__.'/products.php';
require __DIR__.'/product-stock.php';
require __DIR__.'/menu-categories.php';
require __DIR__.'/daily-menus.php';
require __DIR__.'/daily-menu-products.php';
require __DIR__.'/bills.php';
require __DIR__.'/orders.php';
require __DIR__.'/order-items.php';
require __DIR__.'/kitchen.php';
require __DIR__.'/cash-register.php';
require __DIR__.'/reports.php';
require __DIR__.'/receipts.php';
