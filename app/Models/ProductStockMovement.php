<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'product_stock_id',
    'type',
    'quantity',
    'quantity_before',
    'quantity_after',
    'description',
])]
class ProductStockMovement extends Model
{
    protected $casts = [
        'quantity' => 'integer',
        'quantity_before' => 'integer',
        'quantity_after' => 'integer',
    ];

    /** @return BelongsTo<ProductStock, $this> */
    public function productStock(): BelongsTo
    {
        return $this->belongsTo(
            ProductStock::class,
            'product_stock_id'
        );
    }
}
