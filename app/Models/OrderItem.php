<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
 * @property bool $is_cancelled
 * @property-read Order $order
 * @property-read Product|null $product
 * @property-read MenuModality|null $menuModality
 * @property-read Collection<int, DailyMenuProduct> $dailyMenuProducts
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
    'is_cancelled',
    'cancellation_reason',
    'cancelled_by',
    'cancelled_at',
])]
class OrderItem extends Model
{
    protected $attributes = [
        'kitchen_status' => 'pendiente',
        'is_cancelled' => false,
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_price' => 'decimal:2',
            'subtotal' => 'decimal:2',
            'is_cancelled' => 'boolean',
            'cancelled_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
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

    /** @return HasMany<OrderItemMenuProduct, $this> */
    public function orderItemMenuProducts(): HasMany
    {
        return $this->hasMany(OrderItemMenuProduct::class, 'order_item_id');
    }

    /** @return BelongsToMany<DailyMenuProduct, $this> */
    public function dailyMenuProducts(): BelongsToMany
    {
        return $this->belongsToMany(
            DailyMenuProduct::class,
            'order_item_menu_products',
            'order_item_id',
            'daily_menu_product_id'
        )->withPivot('quantity')->withTimestamps();
    }

    /** @return HasMany<CancellationRequest, $this> */
    public function cancellationRequests(): HasMany
    {
        return $this->hasMany(CancellationRequest::class);
    }
}
