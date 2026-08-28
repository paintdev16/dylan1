<?php

use App\Http\Controllers\Web\CashRegisterController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('cash-register', [CashRegisterController::class, 'index'])
        ->name('cash-register.index');

    Route::post('cash-register/open', [CashRegisterController::class, 'openSession'])
        ->name('cash-register.open');

    Route::post('cash-register/bills/{bill}/pay', [CashRegisterController::class, 'storePayment'])
        ->name('cash-register.pay');

    Route::post('cash-register/sessions/{session}/close', [CashRegisterController::class, 'closeSession'])
        ->name('cash-register.close');
});
