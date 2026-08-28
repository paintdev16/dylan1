<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductStock;
use App\Models\ProductStockMovement;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class StockService
{
    public function add(
        Product $product,
        int $quantity,
        ?string $description = null
    ): ProductStockMovement {
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
    ): ProductStockMovement {
        $this->ensurePositiveQuantity($quantity);

        return $this->recordMovement(
            $product,
            'salida',
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
    ): ProductStockMovement {
        if ($quantity < 0) {
            throw new InvalidArgumentException(
                'La cantidad ajustada no puede ser negativa.'
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
    ): ProductStockMovement {
        return DB::transaction(function () use (
            $product,
            $type,
            $quantity,
            $description,
            $resolveQuantityAfter
        ): ProductStockMovement {
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

            if ($quantityAfter === 0) {
                $lockedProduct->update(['status' => 'inactivo']);
            }

            return $stock->movements()->create([
                'type' => $type,
                'quantity' => $type === 'ajuste'
                    ? abs($quantityAfter - $quantityBefore)
                    : $quantity,
                'quantity_before' => $quantityBefore,
                'quantity_after' => $quantityAfter,
                'description' => $description,
            ]);
        });
    }
}
