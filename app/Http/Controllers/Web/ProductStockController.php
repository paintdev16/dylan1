<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\StockService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class ProductStockController extends Controller
{
    public function __construct(private StockService $stockService) {}

    public function add(Request $request, Product $product): RedirectResponse
    {
        $validated = $this->validateMovement($request, 1);

        $this->stockService->add(
            $product,
            $validated['quantity'],
            $validated['description'] ?? null
        );

        return back()->with('success', 'Entrada de stock registrada correctamente.');
    }

    public function remove(Request $request, Product $product): RedirectResponse
    {
        $validated = $this->validateMovement($request, 1);

        try {
            $this->stockService->remove(
                $product,
                $validated['quantity'],
                $validated['description'] ?? null
            );
        } catch (InvalidArgumentException $exception) {
            return back()->withErrors([
                'quantity' => $exception->getMessage(),
            ]);
        }

        return back()->with('success', 'Salida de stock registrada correctamente.');
    }

    public function adjust(Request $request, Product $product): RedirectResponse
    {
        $validated = $this->validateMovement($request, 0);

        $this->stockService->adjust(
            $product,
            $validated['quantity'],
            $validated['description'] ?? null
        );

        return back()->with('success', 'Ajuste de stock registrado correctamente.');
    }

    /**
     * @return array{quantity: int, description?: string|null}
     */
    private function validateMovement(Request $request, int $minimum): array
    {
        return $request->validate([
            'quantity' => [
                'required',
                'integer',
                'min:'.$minimum,
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);
    }
}
