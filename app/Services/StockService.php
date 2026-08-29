<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductStock;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class StockService
{
    public function add(
        Product $product,
        int $quantity,
        ?string $description = null
    ): StockMovement {
        $this->ensurePositiveQuantity($quantity);

        return $this->recordMovement(
            $product,
            'entrada',
            $quantity,
            $description,
            fn (int $quantityBefore): int => $quantityBefore + $quantity
        );
    }

    public function remove(
        Product $product,
        int $quantity,
        ?string $description = null
    ): StockMovement {
        $this->ensurePositiveQuantity($quantity);

        return $this->recordMovement(
            $product,
            'salida_venta',
            $quantity,
            $description,
            function (int $quantityBefore) use ($quantity): int {
                if ($quantity > $quantityBefore) {
                    throw new InvalidArgumentException(
                        'No hay stock suficiente para registrar la salida.'
                    );
                }

                return $quantityBefore - $quantity;
            }
        );
    }

    public function adjust(
        Product $product,
        int $quantity,
        ?string $description = null
    ): StockMovement {
        if ($quantity < 0) {
            throw new InvalidArgumentException(
                'La cantidad ajustada no puede ser negativa.'
            );
        }

        if (blank($description)) {
            throw new InvalidArgumentException(
                'Debe indicar el motivo del ajuste de stock.'
            );
        }

        return $this->recordMovement(
            $product,
            'ajuste',
            $quantity,
            $description,
            fn (): int => $quantity
        );
    }

    private function ensurePositiveQuantity(int $quantity): void
    {
        if ($quantity <= 0) {
            throw new InvalidArgumentException(
                'La cantidad debe ser mayor que cero.'
            );
        }
    }

    private function recordMovement(
        Product $product,
        string $type,
        int $quantity,
        ?string $description,
        callable $resolveQuantityAfter
    ): StockMovement {
        return DB::transaction(function () use (
            $product,
            $type,
            $quantity,
            $description,
            $resolveQuantityAfter
        ): StockMovement {
            $lockedProduct = Product::query()
                ->whereKey($product->id)
                ->lockForUpdate()
                ->firstOrFail();

            $stock = ProductStock::firstOrCreate([
                'product_id' => $product->id,
            ]);

            $stock->refresh();

            $quantityBefore = $stock->quantity;
            $quantityAfter = $resolveQuantityAfter($quantityBefore);

            $stock->update(['quantity' => $quantityAfter]);

            return StockMovement::create([
                'product_id' => $lockedProduct->id,
                'user_id' => auth()->id(),
                'type' => $type,
                'quantity' => $type === 'ajuste'
                    ? abs($quantityAfter - $quantityBefore)
                    : $quantity,
                'quantity_change' => $quantityAfter - $quantityBefore,
                'previous_quantity' => $quantityBefore,
                'new_quantity' => $quantityAfter,
                'description' => $description,
            ]);
        });
    }
}
