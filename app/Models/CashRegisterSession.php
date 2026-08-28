<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $user_id
 * @property string $opening_amount
 * @property string|null $closing_amount
 * @property string|null $expected_amount
 * @property string|null $difference
 * @property string|null $notes
 * @property string $status
 * @property Carbon $opened_at
 * @property Carbon|null $closed_at
 * @property-read User $cashier
 * @property-read Collection<int, Payment> $payments
 */
#[Fillable([
    'user_id',
    'opening_amount',
    'closing_amount',
    'expected_amount',
    'difference',
    'notes',
    'status',
    'opened_at',
    'closed_at',
])]
class CashRegisterSession extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'opening_amount' => 'decimal:2',
            'closing_amount' => 'decimal:2',
            'expected_amount' => 'decimal:2',
            'difference' => 'decimal:2',
            'opened_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'cash_register_session_id');
    }
}
