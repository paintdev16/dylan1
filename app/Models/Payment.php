<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int|null $cash_register_session_id
 * @property int $bill_id
 * @property int $cashier_id
 * @property string $payment_method
 * @property float $amount
 * @property string|null $receipt_number
 * @property-read CashRegisterSession|null $cashRegisterSession
 * @property-read Bill $bill
 * @property-read User $cashier
 */
#[Fillable([
    'cash_register_session_id',
    'payment_group_id',
    'bill_id',
    'cashier_id',
    'payment_method',
    'amount',
    'received_amount',
    'change_amount',
    'operation_code',
    'receipt_type',
    'receipt_number',
    'customer_name',
    'customer_document',
])]
class Payment extends Model
{
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'received_amount' => 'decimal:2',
            'change_amount' => 'decimal:2',
        ];
    }

    /** @return BelongsTo<CashRegisterSession, $this> */
    public function cashRegisterSession(): BelongsTo
    {
        return $this->belongsTo(CashRegisterSession::class, 'cash_register_session_id');
    }

    /** @return BelongsTo<Bill, $this> */
    public function bill(): BelongsTo
    {
        return $this->belongsTo(Bill::class);
    }

    /** @return BelongsTo<User, $this> */
    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }
}
