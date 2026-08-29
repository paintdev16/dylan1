<?php

use App\Http\Controllers\Web\ReportController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:super-admin|admin'])
    ->get('reports', [ReportController::class, 'index'])
    ->name('reports.index');
