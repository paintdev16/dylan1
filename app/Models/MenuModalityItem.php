<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'menu_modality_id',
    'daily_menu_product_id',
    'item_type',
    'quantity',
])]
class MenuModalityItem extends Model
{
    protected $casts = [
        'quantity' => 'integer',
    ];

    /** @return BelongsTo<MenuModality, $this> */
    public function menuModality(): BelongsTo
    {
        return $this->belongsTo(MenuModality::class);
    }

    /** @return BelongsTo<DailyMenuProduct, $this> */
    public function dailyMenuProduct(): BelongsTo
    {
        return $this->belongsTo(DailyMenuProduct::class);
    }
}
