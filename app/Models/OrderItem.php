<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $order_id
 * @property int|null $product_id
 * @property int|null $menu_modality_id
 * @property int $quantity
 * @property string|null $notes
 * @property string $unit_price
 * @property string $subtotal
 * @property string $kitchen_status
 * @property-read Order $order
 * @property-read Product|null $product
 * @property-read MenuModality|null $menuModality
 */
#[Fillable([
    'order_id',
    'product_id',
    'menu_modality_id',
    'quantity',
    'notes',
    'unit_price',
    'subtotal',
    'kitchen_status',
])]
class OrderItem extends Model
{
    protected $attributes = [
        'kitchen_status' => 'pendiente',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_price' => 'decimal:2',
            'subtotal' => 'decimal:2',
        ];
    }

    /** @return BelongsTo<Order, $this> */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /** @return BelongsTo<MenuModality, $this> */
    public function menuModality(): BelongsTo
    {
        return $this->belongsTo(MenuModality::class, 'menu_modality_id');
    }
}
