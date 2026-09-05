<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
        ]);

        $today = now('America/Lima')->toDateString();
        $from = $validated['from'] ?? $today;
        $to = $validated['to'] ?? $today;

        $payments = Payment::query()
            ->select([
                'id',
                'bill_id',
                'cashier_id',
                'payment_method',
                'amount',
                'operation_code',
                'receipt_type',
                'receipt_number',
                'customer_name',
                'customer_document',
                'created_at',
            ])
            ->with([
                'bill:id,table_id,order_type',
                'bill.restaurantTable:id,number',
                'cashier:id,name',
                'receipt:id,payment_id,number',
            ])
            ->whereDate('created_at', '>=', $from)
            ->whereDate('created_at', '<=', $to)
            ->latest()
            ->get();

        $topProducts = Product::query()
            ->select(['products.id', 'products.name'])
            ->join('order_items', 'order_items.product_id', '=', 'products.id')
            ->where('order_items.is_cancelled', false)
            ->whereDate('order_items.created_at', '>=', $from)
            ->whereDate('order_items.created_at', '<=', $to)
            ->selectRaw('SUM(order_items.quantity) as quantity_sold')
            ->selectRaw('SUM(order_items.subtotal) as sales_total')
            ->groupBy('products.id', 'products.name')
            ->get()
            ->map(fn (Product $product): array => [
                'id' => $product->id,
                'type' => 'product',
                'name' => $product->name,
                'quantity_sold' => (int) $product->getAttribute('quantity_sold'),
                'sales_total' => (float) $product->getAttribute('sales_total'),
            ]);

        $topEconomicMenuMainCourses = Product::query()
            ->select(['products.id', 'products.name'])
            ->join('daily_menu_products', 'daily_menu_products.product_id', '=', 'products.id')
            ->join('order_item_menu_products', 'order_item_menu_products.daily_menu_product_id', '=', 'daily_menu_products.id')
            ->join('order_items', 'order_items.id', '=', 'order_item_menu_products.order_item_id')
            ->join('menu_subcategory_types', 'menu_subcategory_types.id', '=', 'products.menu_subcategory_type_id')
            ->where('menu_subcategory_types.code', 'main_course')
            ->whereNotNull('order_items.menu_modality_id')
            ->where('order_items.is_cancelled', false)
            ->whereDate('order_items.created_at', '>=', $from)
            ->whereDate('order_items.created_at', '<=', $to)
            ->selectRaw('SUM(order_item_menu_products.quantity) as quantity_sold')
            ->selectRaw('SUM(order_items.subtotal) as sales_total')
            ->groupBy('products.id', 'products.name')
            ->get()
            ->map(fn (Product $product): array => [
                'id' => $product->id,
                'type' => 'economic_menu',
                'name' => $product->name,
                'quantity_sold' => (int) $product->getAttribute('quantity_sold'),
                'sales_total' => (float) $product->getAttribute('sales_total'),
            ]);

        $topSales = $topProducts
            ->concat($topEconomicMenuMainCourses)
            ->sortByDesc('quantity_sold')
            ->take(10)
            ->values();

        return inertia('reports/index', [
            'filters' => compact('from', 'to'),
            'summary' => [
                'total' => (float) $payments->sum('amount'),
                'transactions' => $payments->count(),
                'cash' => (float) $payments->where('payment_method', 'cash')->sum('amount'),
                'card' => (float) $payments->where('payment_method', 'card')->sum('amount'),
                'digital' => (float) $payments->whereIn('payment_method', ['yape', 'plin'])->sum('amount'),
            ],
            'topProducts' => $topSales,
            'payments' => $payments->map(fn (Payment $payment): array => [
                'id' => $payment->id,
                'bill_id' => $payment->bill_id,
                'table_number' => $payment->bill->restaurantTable?->number,
                'order_type' => $payment->bill->order_type,
                'cashier_name' => $payment->cashier->name,
                'payment_method' => $payment->payment_method,
                'amount' => (float) $payment->amount,
                'operation_code' => $payment->operation_code,
                'receipt_type' => $payment->receipt_type,
                'receipt_number' => $payment->receipt_number,
                'customer_name' => $payment->customer_name,
                'customer_document' => $payment->customer_document,
                'paid_at' => $payment->created_at->toIso8601String(),
                'receipt_print_url' => $payment->receipt ? route('receipts.print', $payment->receipt) : null,
                'receipt_download_url' => $payment->receipt ? route('receipts.download', $payment->receipt) : null,
            ]),
        ]);
    }
}
