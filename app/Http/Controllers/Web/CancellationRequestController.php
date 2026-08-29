<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\CancellationRequest;
use App\Models\OrderItem;
use App\Services\OrderStockService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CancellationRequestController extends Controller
{
    public function __construct(private readonly OrderStockService $stockService) {}

    public function review(Request $request, CancellationRequest $cancellationRequest): RedirectResponse
    {
        $validated = $request->validate([
            'decision' => ['required', 'in:approved,rejected'],
            'review_notes' => ['nullable', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($cancellationRequest, $request, $validated): void {
            $lockedRequest = CancellationRequest::whereKey($cancellationRequest->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless($lockedRequest->status === 'pending', 409, 'La solicitud ya fue revisada.');

            $lockedRequest->update([
                'status' => $validated['decision'],
                'reviewed_by' => $request->user()->id,
                'review_notes' => $validated['review_notes'] ?? null,
                'reviewed_at' => now(),
            ]);

            if ($validated['decision'] !== 'approved') {
                return;
            }

            $orderItem = OrderItem::whereKey($lockedRequest->order_item_id)
                ->lockForUpdate()
                ->firstOrFail();

            if (! $orderItem->is_cancelled) {
                $orderItem->update([
                    'is_cancelled' => true,
                    'cancellation_reason' => $lockedRequest->reason,
                    'cancelled_by' => $request->user()->id,
                    'cancelled_at' => now(),
                ]);
                $this->stockService->restoreStockForOrderItem($orderItem);
            }
        });

        return back()->with('success', 'Solicitud de cancelación revisada.');
    }
}
