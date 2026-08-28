<?php

use App\Http\Controllers\Web\BillController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('bills', [BillController::class, 'index'])
        ->name('bills.index');

    Route::post('bills', [BillController::class, 'store'])
        ->name('bills.store');

    Route::patch('bills/{bill}/close', [BillController::class, 'close'])
        ->name('bills.close');
});
