<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\MenuModality;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(): Response
    {
        $orders = Order::query()
            ->with([
                'bill.restaurantTable',
                'user',
                'items.product',
                'items.menuModality',
            ])
            ->latest()
            ->get();

        $openBills = Bill::query()
            ->with(['restaurantTable', 'openingWaiter'])
            ->where('status', 'open')
            ->orderByDesc('opened_at')
            ->get();

        $products = Product::query()
            ->where('status', 'activo')
            ->orderBy('name')
            ->get();

        $menuModalities = MenuModality::query()
            ->where('active', true)
            ->orderBy('name')
            ->get();

        return inertia('orders/index', compact('orders', 'openBills', 'products', 'menuModalities'));
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'bill_id' => ['required', 'integer', 'exists:bills,id'],
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
            'menu_modality_id' => ['nullable', 'integer', 'exists:menu_modalities,id'],
            'quantity' => ['nullable', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $bill = Bill::query()->whereKey($validated['bill_id'])->firstOrFail();

        if ($bill->status !== 'open') {
            return back()->withErrors([
                'bill_id' => 'No se pueden registrar pedidos en una cuenta cerrada.',
            ]);
        }

        DB::transaction(function () use ($validated, $request, $bill): void {
            $order = Order::create([
                'bill_id' => $bill->id,
                'user_id' => $request->user()->id,
                'status' => 'pendiente',
            ]);

            // Create initial item if specified
            $productId = $validated['product_id'] ?? null;
            $menuModalityId = $validated['menu_modality_id'] ?? null;

            if ($productId || $menuModalityId) {
                $quantity = $validated['quantity'] ?? 1;
                $unitPrice = 0;

                if ($productId) {
                    $product = Product::find($productId);
                    $unitPrice = (float) ($product?->price ?? 0);
                } elseif ($menuModalityId) {
                    $modality = MenuModality::find($menuModalityId);
                    $unitPrice = (float) ($modality?->price ?? 0);
                }

                $order->items()->create([
                    'product_id' => $productId,
                    'menu_modality_id' => $menuModalityId,
                    'quantity' => $quantity,
                    'notes' => $validated['notes'] ?? null,
                    'unit_price' => $unitPrice,
                    'subtotal' => round($unitPrice * $quantity, 2),
                    'kitchen_status' => 'pendiente',
                ]);
            }
        });

        return redirect()
            ->route('orders.index')
            ->with('success', 'Comanda registrada correctamente.');
    }

    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:enviado_cocina,completado'],
        ]);

        $nextStatuses = [
            'pendiente' => 'enviado_cocina',
            'enviado_cocina' => 'completado',
        ];

        if (($nextStatuses[$order->status] ?? null) !== $validated['status']) {
            return back()->withErrors([
                'status' => 'El estado de la comanda no puede retroceder ni saltar pasos.',
            ]);
        }

        $order->update(['status' => $validated['status']]);

        return redirect()
            ->route('orders.index')
            ->with('success', 'Estado de la comanda actualizado.');
    }

    public function destroy(Order $order): RedirectResponse
    {
        if ($order->items()->where('kitchen_status', '!=', 'pendiente')->exists()) {
            return back()->withErrors([
                'order' => 'No se puede eliminar una comanda cuyos productos ya están en preparación en cocina.',
            ]);
        }

        $order->delete();

        return redirect()
            ->route('orders.index')
            ->with('success', 'Comanda eliminada correctamente.');
    }
}
