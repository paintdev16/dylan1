<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'menu_category_id',
    'menu_subcategory_id',
    'menu_subcategory_type_id',
    'name',
    'description',
    'presentation',
    'price',
    'image',
    'type',
    'status',
])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    protected $casts = [
        'price' => 'decimal:2',
    ];

    /** @return BelongsTo<MenuCategory, $this> */
    public function menuCategory(): BelongsTo
    {
        return $this->belongsTo(
            MenuCategory::class,
            'menu_category_id'
        );
    }

    /** @return BelongsTo<MenuSubcategory, $this> */
    public function menuSubcategory(): BelongsTo
    {
        return $this->belongsTo(
            MenuSubcategory::class,
            'menu_subcategory_id'
        );
    }

    /** @return BelongsTo<MenuSubcategoryType, $this> */
    public function menuSubcategoryType(): BelongsTo
    {
        return $this->belongsTo(
            MenuSubcategoryType::class,
            'menu_subcategory_type_id'
        );
    }

    /** @return HasMany<DailyMenuProduct, $this> */
    public function dailyMenuProducts(): HasMany
    {
        return $this->hasMany(
            DailyMenuProduct::class,
            'product_id'
        );
    }

    /** @return HasOne<ProductStock, $this> */
    public function productStock(): HasOne
    {
        return $this->hasOne(
            ProductStock::class,
            'product_id'
        );
    }

    /** @return HasMany<OrderItem, $this> */
    public function orderItems(): HasMany
    {
        return $this->hasMany(
            OrderItem::class,
            'product_id'
        );
    }
}
