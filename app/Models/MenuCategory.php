<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name',
    'display_order',
    'active',
])]
class MenuCategory extends Model
{
    protected $casts = [
        'display_order' => 'integer',
        'active' => 'boolean',
    ];

    protected $appends = [
        'requires_presentation',
    ];

    public function getRequiresPresentationAttribute(): bool
    {
        return $this->name === 'Bebidas';
    }

    /** @return HasMany<Product, $this> */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /** @return HasMany<MenuSubcategory, $this> */
    public function menuSubcategories(): HasMany
    {
        return $this->hasMany(MenuSubcategory::class);
    }
}
