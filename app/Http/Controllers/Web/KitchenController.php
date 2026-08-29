<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class KitchenController extends Controller
{
    public function index(): Response
    {
        $orders = Order::query()
            ->with([
                'bill.restaurantTable',
                'user',
                'items' => function ($query) {
                    $query->whereIn('kitchen_status', ['pendiente', 'en_preparacion', 'listo'])
                        ->with([
                            'product',
                            'menuModality',
                            'dailyMenuProducts.product',
                        ]);
                },
            ])
            ->whereHas('items', function ($query) {
                $query->whereIn('kitchen_status', ['pendiente', 'en_preparacion']);
            })
            ->whereHas('bill', fn ($query) => $query->where('status', 'open'))
            ->orderBy('created_at', 'asc')
            ->get();

        return inertia('kitchen/index', compact('orders'));
    }

    public function updateItemStatus(Request $request, OrderItem $orderItem): RedirectResponse
    {
        $validated = $request->validate([
            'kitchen_status' => ['required', 'in:pendiente,en_preparacion,listo,entregado'],
        ]);

        $orderItem->update([
            'kitchen_status' => $validated['kitchen_status'],
        ]);

        return back()->with('success', 'Estado de plato en cocina actualizado.');
    }
}
