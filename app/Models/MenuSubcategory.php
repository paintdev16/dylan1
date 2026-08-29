<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'menu_category_id',
    'name',
    'code',
    'display_order',
    'active',
])]
class MenuSubcategory extends Model
{
    protected static function booted(): void
    {
        static::creating(function (MenuSubcategory $subcategory): void {
            $subcategory->code ??= match ($subcategory->name) {
                'Menú Económico' => 'economic_menu',
                'Platos Especiales' => 'special_dishes',
                default => null,
            };
        });
    }

    protected $casts = [
        'display_order' => 'integer',
        'active' => 'boolean',
    ];

    /**
     * Categoría principal a la que pertenece.
     */
    /** @return BelongsTo<MenuCategory, $this> */
    public function menuCategory(): BelongsTo
    {
        return $this->belongsTo(MenuCategory::class);
    }

    /**
     * Productos pertenecientes a esta subcategoría.
     */
    /** @return HasMany<Product, $this> */
    public function products(): HasMany
    {
        return $this->hasMany(
            Product::class,
            'menu_subcategory_id'
        );
    }

    /** @return HasMany<MenuSubcategoryType, $this> */
    public function types(): HasMany
    {
        return $this->hasMany(
            MenuSubcategoryType::class,
            'menu_subcategory_id'
        )->orderBy('display_order');
    }
}
