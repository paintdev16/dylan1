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

        $from = $validated['from'] ?? now('America/Lima')->startOfMonth()->toDateString();
        $to = $validated['to'] ?? now('America/Lima')->toDateString();

        $payments = Payment::query()
            ->whereDate('created_at', '>=', $from)
            ->whereDate('created_at', '<=', $to)
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
            ->orderByDesc('quantity_sold')
            ->limit(10)
            ->get();

        return inertia('reports/index', [
            'filters' => compact('from', 'to'),
            'summary' => [
                'total' => (float) $payments->sum('amount'),
                'transactions' => $payments->count(),
                'cash' => (float) $payments->where('payment_method', 'cash')->sum('amount'),
                'card' => (float) $payments->where('payment_method', 'card')->sum('amount'),
                'digital' => (float) $payments->whereIn('payment_method', ['yape', 'plin'])->sum('amount'),
            ],
            'topProducts' => $topProducts,
        ]);
    }
}
