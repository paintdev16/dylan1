<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'daily_menu_id',
    'product_id',
    'price',
    'quantity_available',
    'display_order',
    'active',
])]
class DailyMenuProduct extends Model
{
    protected $casts = [
        'active' => 'boolean',
        'price' => 'decimal:2',
        'quantity_available' => 'integer',
        'display_order' => 'integer',
    ];

    /** @return BelongsTo<DailyMenu, $this> */
    public function dailyMenu(): BelongsTo
    {
        return $this->belongsTo(DailyMenu::class);
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
