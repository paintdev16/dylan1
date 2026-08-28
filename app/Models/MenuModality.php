<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'daily_menu_id',
    'name',
    'description',
    'price',
    'display_order',
    'active',
])]
class MenuModality extends Model
{
    protected $casts = [
        'price' => 'decimal:2',
        'active' => 'boolean',
    ];

    /** @return BelongsTo<DailyMenu, $this> */
    public function dailyMenu(): BelongsTo
    {
        return $this->belongsTo(DailyMenu::class, 'daily_menu_id');
    }

    /** @return HasMany<MenuModalityItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(
            MenuModalityItem::class,
            'menu_modality_id'
        );
    }

    /** @return HasMany<OrderItem, $this> */
    public function orderItems(): HasMany
    {
        return $this->hasMany(
            OrderItem::class,
            'menu_modality_id'
        );
    }
}
