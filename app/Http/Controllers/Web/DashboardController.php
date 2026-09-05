<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\DailyMenu;
use App\Models\DailyMenuProduct;
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

        /*
        |--------------------------------------------------------------------------
        | Payments
        |--------------------------------------------------------------------------
        */

        $todayPayments = Payment::whereDate('created_at', $today)->get();

        $todaySales = (float) $todayPayments->sum('amount');

        $todaySalesCash = (float) $todayPayments
            ->where('payment_method', 'cash')
            ->sum('amount');

        $todaySalesCard = (float) $todayPayments
            ->where('payment_method', 'card')
            ->sum('amount');

        $todaySalesDigital = (float) $todayPayments
            ->whereIn('payment_method', ['yape', 'plin'])
            ->sum('amount');

        /*
        |--------------------------------------------------------------------------
        | Tables
        |--------------------------------------------------------------------------
        */

        $availableTablesQuery = RestaurantTable::query()
            ->where('status', '!=', 'out_of_service');

        $occupiedTables = (clone $availableTablesQuery)
            ->where('status', 'occupied')
            ->count();

        $totalTables = (clone $availableTablesQuery)->count();

        /*
        |--------------------------------------------------------------------------
        | Kitchen
        |--------------------------------------------------------------------------
        */

        $pendingKitchenItems = OrderItem::query()
            ->where('is_cancelled', false)
            ->whereIn('kitchen_status', [
                'pending',
                'in_preparation',
            ])
            ->whereHas('order.bill', fn ($query) => $query->where('status', 'open'))
            ->count();

        /*
        |--------------------------------------------------------------------------
        | Bills
        |--------------------------------------------------------------------------
        */

        $openBills = Bill::query()
            ->where('status', 'open')
            ->get();

        $pendingBillsCount = $openBills->count();

        $pendingBillsBalance = (float) $openBills->sum('balance');

        /*
        |--------------------------------------------------------------------------
        | Today's daily menu
        |--------------------------------------------------------------------------
        */

        $todayDailyMenu = DailyMenu::query()
            ->where('date', $today)
            ->where('active', true)
            ->first();

        /*
        |--------------------------------------------------------------------------
        | Daily menu products
        |--------------------------------------------------------------------------
        */

        $dailyMenuProducts = $todayDailyMenu
            ? DailyMenuProduct::query()
                ->with([
                    'product.menuCategory',
                    'product.menuSubcategory',
                    'product.menuSubcategoryType',
                ])
                ->where('daily_menu_id', $todayDailyMenu->id)
                ->where('active', true)
                ->where('quantity_available', '>', 0)
                ->orderBy('display_order')
                ->get()
            : collect();

        /*
        |--------------------------------------------------------------------------
        | Economic menu
        |--------------------------------------------------------------------------
        */

        $economicMenuProducts = $dailyMenuProducts
            ->filter(
                fn (DailyMenuProduct $dailyMenuProduct) => $dailyMenuProduct->product
                    ?->menuSubcategory
                    ?->code === 'economic_menu'
            )
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Special dishes
        |--------------------------------------------------------------------------
        */

        $specialDishes = $dailyMenuProducts
            ->filter(
                fn (DailyMenuProduct $dailyMenuProduct) => $dailyMenuProduct->product
                    ?->menuSubcategory
                    ?->code === 'special_dishes'
            )
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Economic menu modalities
        |--------------------------------------------------------------------------
        */

        $menuModalities = $todayDailyMenu
            ? $todayDailyMenu
                ->menuModalities()
                ->with([
                    'items.dailyMenuProduct.product.menuSubcategory',
                    'items.dailyMenuProduct.product.menuSubcategoryType',
                ])
                ->where('active', true)
                ->orderBy('display_order')
                ->get()
            : collect();

        /*
        |--------------------------------------------------------------------------
        | Recent orders
        |--------------------------------------------------------------------------
        */

        $recentOrders = Order::query()
            ->with([
                'bill.restaurantTable',
                'user',
                'items.product.menuCategory',
                'items.product.menuSubcategory',
                'items.product.menuSubcategoryType',
                'items.menuModality',
                'items.dailyMenuProducts.product.menuSubcategoryType',
            ])
            ->orderByDesc('created_at')
            ->limit(6)
            ->get();

        return inertia('dashboard', [
            /*
            |--------------------------------------------------------------------------
            | Dashboard metrics
            |--------------------------------------------------------------------------
            */

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

            /*
            |--------------------------------------------------------------------------
            | Today's menu
            |--------------------------------------------------------------------------
            */

            'dailyMenu' => $todayDailyMenu,

            'economicMenuProducts' => $economicMenuProducts,

            'specialDishes' => $specialDishes,

            'menuModalities' => $menuModalities,

            /*
            |--------------------------------------------------------------------------
            | Recent orders
            |--------------------------------------------------------------------------
            */

            'recentOrders' => $recentOrders,
        ]);
    }
}
