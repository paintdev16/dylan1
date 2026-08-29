<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use Inertia\Response;

class BillController extends Controller
{
    public function index(): Response
    {
        $bills = Bill::query()
            ->with([
                'restaurantTable',
                'openingWaiter',
                'orders.user',
                'orders.items.product',
                'orders.items.menuModality',
                'orders.items.dailyMenuProducts.product',
                'payments.cashier',
            ])
            ->orderByDesc('opened_at')
            ->get();

        return inertia('bills/index', compact('bills'));
    }
}
