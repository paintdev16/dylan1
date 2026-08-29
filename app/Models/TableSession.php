<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property int $id
 * @property int $restaurant_table_id
 * @property int $waiter_id
 * @property int $customer_count
 * @property string $status
 * @property Carbon $opened_at
 * @property Carbon|null $closed_at
 * @property-read RestaurantTable $restaurantTable
 * @property-read User $waiter
 * @property-read Bill|null $bill
 */
#[Fillable([
    'restaurant_table_id',
    'waiter_id',
    'customer_count',
    'status',
    'opened_at',
    'closed_at',
])]
class TableSession extends Model
{
    protected function casts(): array
    {
        return [
            'customer_count' => 'integer',
            'opened_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<RestaurantTable, $this> */
    public function restaurantTable(): BelongsTo
    {
        return $this->belongsTo(RestaurantTable::class, 'restaurant_table_id');
    }

    /** @return BelongsTo<User, $this> */
    public function waiter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'waiter_id');
    }

    /** @return HasOne<Bill, $this> */
    public function bill(): HasOne
    {
        return $this->hasOne(Bill::class, 'table_session_id');
    }
}
