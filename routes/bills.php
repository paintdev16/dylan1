<?php

use App\Http\Controllers\Web\BillController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:super-admin|admin|cajero|mozo'])
    ->get('bills', [BillController::class, 'index'])
    ->name('bills.index');
