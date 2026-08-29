<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\RestaurantTable;
use Illuminate\Http\Request;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $today = now('America/Lima')->toDateString();

        $todayPayments = Payment::whereDate('created_at', $today)->get();
        $todaySales = (float) $todayPayments->sum('amount');
        $todaySalesCash = (float) $todayPayments->where('payment_method', 'cash')->sum('amount');
        $todaySalesCard = (float) $todayPayments->where('payment_method', 'card')->sum('amount');
        $todaySalesDigital = (float) $todayPayments->whereIn('payment_method', ['yape', 'plin'])->sum('amount');

        $occupiedTables = RestaurantTable::where('status', 'occupied')->count();
        $totalTables = RestaurantTable::count();

        $pendingKitchenItems = OrderItem::where('is_cancelled', false)
            ->whereIn('kitchen_status', ['pending', 'in_preparation'])
            ->count();

        $openBills = Bill::where('status', 'open')->get();
        $pendingBillsCount = $openBills->count();
        $pendingBillsBalance = (float) $openBills->sum('balance');

        $recentOrders = Order::query()
            ->with([
                'bill.restaurantTable',
                'user',
                'items.product',
                'items.menuModality',
            ])
            ->orderByDesc('created_at')
            ->limit(6)
            ->get();

        return inertia('dashboard', [
            'metrics' => [
                'today_sales' => $todaySales,
                'today_sales_cash' => $todaySalesCash,
                'today_sales_card' => $todaySalesCard,
                'today_sales_digital' => $todaySalesDigital,
                'occupied_tables' => $occupiedTables,
                'total_tables' => $totalTables,
                'pending_kitchen_items' => $pendingKitchenItems,
                'pending_bills_count' => $pendingBillsCount,
                'pending_bills_balance' => $pendingBillsBalance,
            ],
            'recentOrders' => $recentOrders,
        ]);
    }
}
