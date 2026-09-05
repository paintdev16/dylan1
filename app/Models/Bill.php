<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int|null $table_session_id
 * @property int|null $table_id
 * @property int $opening_waiter_id
 * @property string $order_type
 * @property string $status
 * @property Carbon $opened_at
 * @property Carbon|null $closed_at
 * @property-read TableSession|null $tableSession
 * @property-read RestaurantTable|null $restaurantTable
 * @property-read User $openingWaiter
 */
#[Fillable([
    'table_session_id',
    'table_id',
    'opening_waiter_id',
    'order_type',
    'status',
    'opened_at',
    'closed_at',
    'sale_snapshot',
    'closed_by',
])]
class Bill extends Model
{
    public $timestamps = false;

    protected $appends = [
        'total_amount',
        'paid_amount',
        'balance',
    ];

    protected function casts(): array
    {
        return [
            'opened_at' => 'datetime',
            'closed_at' => 'datetime',
            'sale_snapshot' => 'array',
        ];
    }

    /** @return BelongsTo<TableSession, $this> */
    public function tableSession(): BelongsTo
    {
        return $this->belongsTo(TableSession::class, 'table_session_id');
    }

    /** @return BelongsTo<RestaurantTable, $this> */
    public function restaurantTable(): BelongsTo
    {
        return $this->belongsTo(RestaurantTable::class, 'table_id');
    }

    /** @return BelongsTo<User, $this> */
    public function openingWaiter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'opening_waiter_id');
    }

    /** @return HasMany<Order, $this> */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /** @return HasMany<Payment, $this> */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /** @return HasOne<Receipt, $this> */
    public function receipt(): HasOne
    {
        return $this->hasOne(Receipt::class);
    }

    public function getTotalAmountAttribute(): float
    {
        if ($this->relationLoaded('orders')) {
            return round((float) $this->orders->flatMap(fn (Order $order) => ($order->relationLoaded('items') ? $order->items : $order->items()->get())->where('is_cancelled', false))->sum('subtotal'), 2);
        }

        return round((float) OrderItem::query()->where('is_cancelled', false)->whereHas('order', fn ($query) => $query->where('bill_id', $this->id))->sum('subtotal'), 2);
    }

    public function getPaidAmountAttribute(): float
    {
        if ($this->relationLoaded('payments')) {
            return round((float) $this->payments->sum('amount'), 2);
        }

        return round((float) $this->payments()->sum('amount'), 2);
    }

    public function getBalanceAttribute(): float
    {
        return round(max(0, $this->total_amount - $this->paid_amount), 2);
    }
}
