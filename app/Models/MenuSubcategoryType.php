<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'menu_subcategory_id',
    'code',
    'name',
    'display_order',
    'active',
])]
class MenuSubcategoryType extends Model
{
    protected static function booted(): void
    {
        static::creating(function (MenuSubcategoryType $type): void {
            $type->code ??= match ($type->name) {
                'Segundos' => 'main_course',
                'Entradas' => 'starter',
                'Postres' => 'dessert',
                default => null,
            };
        });
    }

    /**
     * Subcategoría a la que pertenece este tipo.
     */
    /** @return BelongsTo<MenuSubcategory, $this> */
    public function menuSubcategory(): BelongsTo
    {
        return $this->belongsTo(
            MenuSubcategory::class,
            'menu_subcategory_id'
        );
    }

    /**
     * Productos que utilizan este tipo.
     *
     * Solo será necesario si products tiene
     * menu_subcategory_type_id.
     */
    /** @return HasMany<Product, $this> */
    public function products(): HasMany
    {
        return $this->hasMany(
            Product::class,
            'menu_subcategory_type_id'
        );
    }
}
