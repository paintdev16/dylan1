<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Bill;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\RestaurantTable;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $today = now('America/Lima')->toDateString();
        $todayPayments = Payment::query()->whereDate('created_at', $today)->get();
        $openBills = Bill::query()
            ->with(['orders.items', 'payments'])
            ->where('status', 'open')
            ->get();
        $recentOrders = Order::query()
            ->with($this->orderRelations())
            ->latest()
            ->limit(6)
            ->get();

        return response()->json([
            'data' => [
                'metrics' => [
                    'today_sales' => (float) $todayPayments->sum('amount'),
                    'today_sales_cash' => (float) $todayPayments->where('payment_method', 'cash')->sum('amount'),
                    'today_sales_card' => (float) $todayPayments->where('payment_method', 'card')->sum('amount'),
                    'today_sales_digital' => (float) $todayPayments->whereIn('payment_method', ['yape', 'plin'])->sum('amount'),
                    'occupied_tables' => RestaurantTable::query()->where('status', 'occupied')->count(),
                    'total_tables' => RestaurantTable::query()->count(),
                    'pending_kitchen_items' => OrderItem::query()
                        ->where('is_cancelled', false)
                        ->whereIn('kitchen_status', ['pending', 'in_preparation'])
                        ->whereHas('order.bill', fn ($query) => $query->where('status', 'open'))
                        ->count(),
                    'pending_bills_count' => $openBills->count(),
                    'pending_bills_balance' => round((float) $openBills->sum('balance'), 2),
                ],
                'recent_orders' => OrderResource::collection($recentOrders),
            ],
        ]);
    }

    /** @return array<int, string> */
    private function orderRelations(): array
    {
        return [
            'bill.restaurantTable', 'bill.orders.items', 'bill.payments', 'user',
            'items.product', 'items.menuModality', 'items.orderItemMenuProducts.dailyMenuProduct.product',
        ];
    }
}
