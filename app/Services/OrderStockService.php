<?php

namespace App\Services;

use App\Models\DailyMenuProduct;
use App\Models\MenuModality;
use App\Models\MenuSubcategoryType;
use App\Models\OrderItem;
use App\Models\OrderItemMenuProduct;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\StockMovement;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class OrderStockService
{
    /**
     * Valida y procesa la reserva de stock/porciones para un OrderItem.
     *
     * @param  array<string, mixed>  $data
     * @return array{unit_price: float, subtotal: float, component_ids: array<int>}
     *
     * @throws ValidationException
     */
    public function reserveStockForOrderItem(array $data, int $quantity): array
    {
        $productId = $data['product_id'] ?? null;
        $modalityId = $data['menu_modality_id'] ?? null;
        $componentIds = $data['components'] ?? [];

        if ($productId) {
            return $this->reserveProductStock($productId, $quantity);
        }

        if ($modalityId) {
            return $this->reserveModalityStock($modalityId, $componentIds, $quantity);
        }

        throw ValidationException::withMessages([
            'product_id' => 'Debe seleccionar un producto o una modalidad.',
        ]);
    }

    /**
     * @return array{unit_price: float, subtotal: float, component_ids: array<int>}
     */
    private function reserveProductStock(int $productId, int $quantity): array
    {
        $product = Product::with('menuCategory')->lockForUpdate()->findOrFail($productId);

        if ($product->status !== 'activo') {
            throw ValidationException::withMessages([
                'product_id' => "El producto {$product->name} no está activo.",
            ]);
        }

        // Si es bebida, validar y descontar ProductStock físico
        if ($product->menuCategory?->name === 'Bebidas') {
            $stock = ProductStock::where('product_id', $product->id)->lockForUpdate()->first();
            if (! $stock || $stock->quantity < $quantity) {
                $available = $stock?->quantity ?? 0;
                throw ValidationException::withMessages([
                    'product_id' => "Stock insuficiente para {$product->name} (Disponibles: {$available}).",
                ]);
            }
            $previousQty = $stock->quantity;
            $newQty = $previousQty - $quantity;
            $stock->update(['quantity' => $newQty]);

            StockMovement::create([
                'product_id' => $product->id,
                'user_id' => auth()->id(),
                'type' => 'salida_venta',
                'quantity' => $quantity,
                'previous_quantity' => $previousQty,
                'new_quantity' => $newQty,
                'description' => 'Venta de comanda',
            ]);
        }

        // Si está en el menú diario de hoy (ej. plato especial)
        $todayDate = now('America/Lima')->toDateString();
        $dailyMenuProduct = DailyMenuProduct::where('product_id', $product->id)
            ->whereHas('dailyMenu', fn ($q) => $q->where('date', $todayDate))
            ->lockForUpdate()
            ->first();

        if ($dailyMenuProduct) {
            if ($dailyMenuProduct->quantity_available < $quantity) {
                throw ValidationException::withMessages([
                    'product_id' => "Porciones insuficientes para {$product->name} (Disponibles: {$dailyMenuProduct->quantity_available}).",
                ]);
            }
            $dailyMenuProduct->decrement('quantity_available', $quantity);
            $this->syncComplementaryQuantities($dailyMenuProduct->daily_menu_id);
        }

        $unitPrice = (float) $product->price;

        return [
            'unit_price' => $unitPrice,
            'subtotal' => round($unitPrice * $quantity, 2),
            'component_ids' => [],
        ];
    }

    /**
     * @param  array<int>  $componentIds
     * @return array{unit_price: float, subtotal: float, component_ids: array<int>}
     */
    private function reserveModalityStock(int $modalityId, array $componentIds, int $quantity): array
    {
        $modality = MenuModality::with('dailyMenu')->lockForUpdate()->findOrFail($modalityId);

        if (! $modality->active) {
            throw ValidationException::withMessages([
                'menu_modality_id' => "La modalidad {$modality->name} no está activa.",
            ]);
        }

        $todayDate = now('America/Lima')->toDateString();
        if ($modality->dailyMenu->date->format('Y-m-d') !== $todayDate || ! $modality->dailyMenu->active) {
            throw ValidationException::withMessages([
                'menu_modality_id' => 'El menú diario de hoy no está activo o publicado.',
            ]);
        }

        if (empty($componentIds)) {
            throw ValidationException::withMessages([
                'components' => 'Debes seleccionar los componentes requeridos para la modalidad.',
            ]);
        }

        /** @var Collection<int, DailyMenuProduct> $components */
        $components = DailyMenuProduct::with(['product.menuSubcategoryType'])
            ->whereIn('id', $componentIds)
            ->where('daily_menu_id', $modality->daily_menu_id)
            ->where('active', true)
            ->lockForUpdate()
            ->get();

        $this->validateModalityComponents($modality, $components);

        // Validar cantidades y descontar
        foreach ($components as $component) {
            if ($component->quantity_available < $quantity) {
                $name = $component->product?->name ?? 'Plato';
                throw ValidationException::withMessages([
                    'components' => "Porciones insuficientes para {$name} (Disponibles: {$component->quantity_available}).",
                ]);
            }
            $component->decrement('quantity_available', $quantity);
        }

        $this->syncComplementaryQuantities($modality->daily_menu_id);

        $unitPrice = (float) $modality->price;

        return [
            'unit_price' => $unitPrice,
            'subtotal' => round($unitPrice * $quantity, 2),
            'component_ids' => $components->pluck('id')->all(),
        ];
    }

    /**
     * @param  Collection<int, DailyMenuProduct>  $components
     */
    private function validateModalityComponents(MenuModality $modality, Collection $components): void
    {
        $modalityName = mb_strtolower(trim($modality->name));

        $types = $components->map(fn ($c) => $c->product?->menuSubcategoryType?->name)->filter()->values();

        $segundosCount = $types->filter(fn ($t) => $t === 'Segundos')->count();
        $entradasCount = $types->filter(fn ($t) => $t === 'Entradas')->count();
        $postresCount = $types->filter(fn ($t) => $t === 'Postres')->count();

        if (str_contains($modalityName, 'completo')) {
            // Requiere 1 Segundo, 1 Entrada, 1 Postre
            if ($segundosCount !== 1 || $entradasCount !== 1 || $postresCount !== 1 || $components->count() !== 3) {
                throw ValidationException::withMessages([
                    'components' => 'El Menú completo debe incluir exactamente un Segundo, una Entrada y un Postre.',
                ]);
            }
        } elseif (str_contains($modalityName, 'segundo')) {
            // Requiere 1 Segundo
            if ($segundosCount !== 1 || $components->count() !== 1) {
                throw ValidationException::withMessages([
                    'components' => 'La modalidad Solo segundo debe incluir exactamente un plato de Segundo.',
                ]);
            }
        } elseif (str_contains($modalityName, 'entrada') && str_contains($modalityName, 'postre')) {
            // Requiere 1 Entrada y 1 Postre
            if ($entradasCount !== 1 || $postresCount !== 1 || $components->count() !== 2) {
                throw ValidationException::withMessages([
                    'components' => 'La modalidad Entrada + postre debe incluir exactamente una Entrada y un Postre.',
                ]);
            }
        }
    }

    /**
     * Restaura el stock / porciones al eliminar o cancelar un OrderItem.
     */
    public function restoreStockForOrderItem(OrderItem $orderItem): void
    {
        $quantity = $orderItem->quantity;

        // Si era modalidad con componentes
        if ($orderItem->menu_modality_id) {
            $componentRelations = OrderItemMenuProduct::where('order_item_id', $orderItem->id)->get();
            $dailyMenuId = null;

            foreach ($componentRelations as $rel) {
                $dmp = DailyMenuProduct::whereKey($rel->daily_menu_product_id)->lockForUpdate()->first();
                if ($dmp) {
                    $dmp->increment('quantity_available', $quantity);
                    $dailyMenuId = $dmp->daily_menu_id;
                }
            }

            if ($dailyMenuId) {
                $this->syncComplementaryQuantities($dailyMenuId);
            }
        }

        // Si era producto individual
        if ($orderItem->product_id) {
            $product = Product::with('menuCategory')->find($orderItem->product_id);
            if ($product) {
                if ($product->menuCategory?->name === 'Bebidas') {
                    $stock = ProductStock::where('product_id', $product->id)->lockForUpdate()->first();
                    if ($stock) {
                        $previousQty = $stock->quantity;
                        $newQty = $previousQty + $quantity;
                        $stock->update(['quantity' => $newQty]);

                        StockMovement::create([
                            'product_id' => $product->id,
                            'user_id' => auth()->id(),
                            'type' => 'cancelacion',
                            'quantity' => $quantity,
                            'previous_quantity' => $previousQty,
                            'new_quantity' => $newQty,
                            'description' => 'Restauración por anulación/cancelación de ítem',
                        ]);
                    }
                }

                $todayDate = now('America/Lima')->toDateString();
                $dmp = DailyMenuProduct::where('product_id', $product->id)
                    ->whereHas('dailyMenu', fn ($q) => $q->where('date', $todayDate))
                    ->lockForUpdate()
                    ->first();

                if ($dmp) {
                    $dmp->increment('quantity_available', $quantity);
                    $this->syncComplementaryQuantities($dmp->daily_menu_id);
                }
            }
        }
    }

    private function syncComplementaryQuantities(int $dailyMenuId): void
    {
        $secondType = MenuSubcategoryType::where('name', 'Segundos')->first();
        if (! $secondType) {
            return;
        }

        $totalSeconds = (int) DailyMenuProduct::query()
            ->where('daily_menu_id', $dailyMenuId)
            ->where('active', true)
            ->whereHas('product', fn ($q) => $q->where('menu_subcategory_type_id', $secondType->id))
            ->sum('quantity_available');

        $complementaryTypes = MenuSubcategoryType::whereIn('name', ['Entradas', 'Postres'])->pluck('id');

        DailyMenuProduct::query()
            ->where('daily_menu_id', $dailyMenuId)
            ->whereHas('product', fn ($q) => $q->whereIn('menu_subcategory_type_id', $complementaryTypes))
            ->update(['quantity_available' => $totalSeconds]);
    }
}
