<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $product_id
 * @property int|null $user_id
 * @property string $type
 * @property int $quantity
 * @property int $quantity_change
 * @property int $previous_quantity
 * @property int $new_quantity
 * @property string|null $description
 * @property-read Product $product
 * @property-read User|null $user
 */
#[Fillable([
    'product_id',
    'user_id',
    'type',
    'quantity',
    'quantity_change',
    'previous_quantity',
    'new_quantity',
    'description',
])]
class StockMovement extends Model
{
    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'quantity_change' => 'integer',
            'previous_quantity' => 'integer',
            'new_quantity' => 'integer',
        ];
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
