<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\MenuModality;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Validator as ValidatorInstance;

class OrderItemController extends Controller
{
    public function index(Order $order): JsonResponse
    {
        $items = $order->items()
            ->with(['product', 'menuModality'])
            ->latest()
            ->get();

        return response()->json(['items' => $items]);
    }

    public function store(Request $request, Order $order): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'product_id' => [
                'nullable',
                'integer',
                'exists:products,id',
                'required_without:menu_modality_id',
            ],
            'menu_modality_id' => [
                'nullable',
                'integer',
                'exists:menu_modalities,id',
                'required_without:product_id',
            ],
            'quantity' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $validator->after(function (ValidatorInstance $validator) use ($request): void {
            if ($request->filled('product_id') && $request->filled('menu_modality_id')) {
                $validator->errors()->add(
                    'product_id',
                    'Selecciona un producto o una modalidad, no ambos.'
                );
                $validator->errors()->add(
                    'menu_modality_id',
                    'Selecciona un producto o una modalidad, no ambos.'
                );
            }
        });

        $validated = $validator->validate();

        if ($order->status === 'completado' || $order->bill->status !== 'open') {
            return back()->withErrors([
                'order' => 'No se pueden agregar ítems a esta comanda.',
            ]);
        }

        $source = $this->resolveSource($validated);

        if ($source === null) {
            return back()->withErrors([
                'product_id' => 'El producto o modalidad seleccionada no está disponible.',
            ]);
        }

        $unitPrice = (float) $source->price;
        $quantity = $validated['quantity'];

        $order->items()->create([
            'product_id' => $source instanceof Product ? $source->id : null,
            'menu_modality_id' => $source instanceof MenuModality ? $source->id : null,
            'quantity' => $quantity,
            'notes' => $validated['notes'] ?? null,
            'unit_price' => $unitPrice,
            'subtotal' => round($unitPrice * $quantity, 2),
            'kitchen_status' => 'pendiente',
        ]);

        return redirect()
            ->route('orders.index')
            ->with('success', 'Producto agregado a la comanda.');
    }

    public function updateKitchenStatus(Request $request, OrderItem $orderItem): RedirectResponse
    {
        $validated = $request->validate([
            'kitchen_status' => [
                'required',
                'in:en_preparacion,listo,entregado',
            ],
        ]);

        $nextStatuses = [
            'pendiente' => 'en_preparacion',
            'en_preparacion' => 'listo',
            'listo' => 'entregado',
        ];

        if (($nextStatuses[$orderItem->kitchen_status] ?? null) !== $validated['kitchen_status']) {
            return back()->withErrors([
                'kitchen_status' => 'El estado de cocina no puede retroceder ni saltar pasos.',
            ]);
        }

        $orderItem->update(['kitchen_status' => $validated['kitchen_status']]);

        return redirect()
            ->route('orders.index')
            ->with('success', 'Estado de cocina actualizado.');
    }

    public function destroy(OrderItem $orderItem): RedirectResponse
    {
        if ($orderItem->kitchen_status === 'entregado') {
            return back()->withErrors([
                'item' => 'No se puede eliminar un ítem que ya ha sido entregado.',
            ]);
        }

        $orderItem->delete();

        return redirect()
            ->route('orders.index')
            ->with('success', 'Ítem eliminado de la comanda.');
    }

    /**
     * @param  array{product_id?: int, menu_modality_id?: int}  $validated
     */
    private function resolveSource(array $validated): Product|MenuModality|null
    {
        if (isset($validated['product_id'])) {
            return Product::query()
                ->whereKey($validated['product_id'])
                ->where('status', 'activo')
                ->first();
        }

        if (! isset($validated['menu_modality_id'])) {
            return null;
        }

        return MenuModality::query()
            ->whereKey($validated['menu_modality_id'])
            ->where('active', true)
            ->first();
    }
}
