<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\CancellationRequest;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemMenuProduct;
use App\Models\Product;
use App\Services\OrderStockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Validator as ValidatorInstance;

class OrderItemController extends Controller
{
    public function __construct(
        private readonly OrderStockService $stockService = new OrderStockService
    ) {}

    public function index(Order $order): JsonResponse
    {
        $items = $order->items()
            ->with([
                'product',
                'menuModality',
                'dailyMenuProducts.product.menuSubcategoryType',
            ])
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
            'components' => [
                'nullable',
                'array',
            ],
            'components.*' => [
                'integer',
                'exists:daily_menu_products,id',
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

        if ($order->status === 'completed' || $order->bill->status !== 'open') {
            return back()->withErrors([
                'order' => 'No se pueden agregar ítems a esta comanda.',
            ]);
        }

        return DB::transaction(function () use ($validated, $order) {
            $quantity = $validated['quantity'];
            $stockResult = $this->stockService->reserveStockForOrderItem($validated, $quantity);

            $productId = $validated['product_id'] ?? null;
            $kitchenStatus = 'pending';
            if ($productId) {
                $prod = Product::query()->with('menuCategory')->whereKey($productId)->first();
                if ($prod?->menuCategory?->code === 'beverages') {
                    $kitchenStatus = 'delivered';
                }
            }

            $orderItem = $order->items()->create([
                'product_id' => $productId,
                'menu_modality_id' => $validated['menu_modality_id'] ?? null,
                'quantity' => $quantity,
                'notes' => $validated['notes'] ?? null,
                'unit_price' => $stockResult['unit_price'],
                'subtotal' => $stockResult['subtotal'],
                'kitchen_status' => $kitchenStatus,
            ]);

            foreach ($stockResult['component_ids'] as $dmpId) {
                OrderItemMenuProduct::create([
                    'order_item_id' => $orderItem->id,
                    'daily_menu_product_id' => $dmpId,
                    'quantity' => $quantity,
                ]);
            }

            return redirect()
                ->route('orders.index')
                ->with('success', 'Producto agregado a la comanda.');
        });
    }

    public function updateKitchenStatus(Request $request, OrderItem $orderItem): RedirectResponse
    {
        $validated = $request->validate([
            'kitchen_status' => [
                'required',
                'in:in_preparation,ready,delivered',
            ],
        ]);

        $nextStatuses = [
            'pending' => 'in_preparation',
            'in_preparation' => 'delivered',
            'ready' => 'delivered',
        ];

        if (($nextStatuses[$orderItem->kitchen_status] ?? null) !== $validated['kitchen_status']) {
            return back()->withErrors([
                'kitchen_status' => 'El estado de cocina no puede retroceder ni saltar pasos.',
            ]);
        }

        DB::transaction(function () use ($orderItem, $validated): void {
            $orderItem->update(['kitchen_status' => $validated['kitchen_status']]);

            $order = $orderItem->order;
            $hasPendingItems = OrderItem::query()
                ->where('order_id', $order->id)
                ->where('kitchen_status', '!=', 'delivered')
                ->exists();

            if (! $hasPendingItems) {
                $order->update(['status' => 'completed']);
            }
        });

        return redirect()
            ->route('orders.index')
            ->with('success', 'Estado de cocina actualizado.');
    }

    public function destroy(OrderItem $orderItem): RedirectResponse
    {
        return back()->withErrors([
            'item' => 'Los consumos no se eliminan. Registra una cancelación para conservar el historial.',
        ]);
    }

    public function cancel(Request $request, OrderItem $orderItem): RedirectResponse
    {
        if ($orderItem->order->bill->status !== 'open') {
            return back()->withErrors([
                'item' => 'No se pueden cancelar ítems de una cuenta ya cerrada o pagada.',
            ]);
        }

        if ($orderItem->is_cancelled) {
            return back()->withErrors([
                'item' => 'Este ítem ya ha sido cancelado previamente.',
            ]);
        }

        $validated = $request->validate([
            'cancellation_reason' => ['required', 'string', 'min:3', 'max:255'],
        ]);

        if ($orderItem->kitchen_status !== 'pending') {
            CancellationRequest::firstOrCreate(
                ['order_item_id' => $orderItem->id, 'status' => 'pending'],
                [
                    'requested_by' => $request->user()->id,
                    'previous_status' => $orderItem->kitchen_status,
                    'reason' => $validated['cancellation_reason'],
                ]
            );

            return redirect()
                ->route('orders.index')
                ->with('success', 'Cancelación enviada a Caja para autorización.');
        }

        DB::transaction(function () use ($orderItem, $validated, $request): void {
            $orderItem->update([
                'is_cancelled' => true,
                'cancellation_reason' => $validated['cancellation_reason'],
                'cancelled_by' => $request->user()->id,
                'cancelled_at' => now(),
            ]);

            $this->stockService->restoreStockForOrderItem($orderItem);
        });

        return redirect()
            ->route('orders.index')
            ->with('success', 'Ítem cancelado correctamente y stock reintegrado.');
    }
}
