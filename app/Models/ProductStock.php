<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['product_id', 'quantity'])]
class ProductStock extends Model
{
    protected $casts = [
        'quantity' => 'integer',
    ];

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(
            Product::class,
            'product_id'
        );
    }

    /** @return HasMany<ProductStockMovement, $this> */
    public function movements(): HasMany
    {
        return $this->hasMany(
            ProductStockMovement::class,
            'product_stock_id'
        );
    }
}
