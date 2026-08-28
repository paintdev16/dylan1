<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'order_item_id',
    'daily_menu_product_id',
    'quantity',
])]
class OrderItemMenuProduct extends Model
{
    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
        ];
    }

    /** @return BelongsTo<OrderItem, $this> */
    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    /** @return BelongsTo<DailyMenuProduct, $this> */
    public function dailyMenuProduct(): BelongsTo
    {
        return $this->belongsTo(DailyMenuProduct::class);
    }
}
