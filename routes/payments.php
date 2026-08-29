<?php

use App\Http\Controllers\Web\PaymentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:super-admin|admin|cajero'])->group(function () {
    Route::post('bills/{bill}/payments', [PaymentController::class, 'store'])
        ->name('bills.payments.store');
});
