<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property int $id
 * @property int $number
 * @property int $capacity
 * @property string $status
 * @property-read TableSession|null $activeSession
 */
#[Fillable(['number', 'capacity', 'status'])]
class RestaurantTable extends Model
{
    /** @return HasMany<Bill, $this> */
    public function bills(): HasMany
    {
        return $this->hasMany(Bill::class, 'table_id');
    }

    /** @return HasMany<TableSession, $this> */
    public function sessions(): HasMany
    {
        return $this->hasMany(TableSession::class, 'restaurant_table_id');
    }

    /** @return HasOne<TableSession, $this> */
    public function activeSession(): HasOne
    {
        return $this->hasOne(TableSession::class, 'restaurant_table_id')
            ->where('status', 'open');
    }
}
