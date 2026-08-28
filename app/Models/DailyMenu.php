<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'date',
    'active',
])]
class DailyMenu extends Model
{
    protected $casts = [
        'date' => 'date',
        'active' => 'boolean',
    ];

    protected $appends = [
        'formatted_date',
    ];

    public function getFormattedDateAttribute(): string
    {
        return $this->date->translatedFormat('d/m/Y');
    }

    /** @return HasMany<DailyMenuProduct, $this> */
    public function dailyMenuProducts(): HasMany
    {
        return $this->hasMany(DailyMenuProduct::class);
    }
}
