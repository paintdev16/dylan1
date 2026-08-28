<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $product_id
 * @property int|null $user_id
 * @property string $type
 * @property int $quantity
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
    'previous_quantity',
    'new_quantity',
    'description',
])]
class StockMovement extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'previous_quantity' => 'integer',
            'new_quantity' => 'integer',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
