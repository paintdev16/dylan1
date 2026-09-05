<?php

use App\Http\Controllers\Web\ReceiptController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:super-admin|admin|cajero'])->group(function () {
    Route::get('receipts/{receipt}/print', [ReceiptController::class, 'print'])
        ->name('receipts.print');
    Route::get('receipts/{receipt}/pdf', [ReceiptController::class, 'download'])
        ->name('receipts.download');
});
