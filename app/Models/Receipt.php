<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'bill_id', 'payment_id', 'number', 'receipt_type', 'customer_name',
    'customer_document', 'subtotal', 'tax', 'total', 'currency',
    'payment_method', 'operation_code', 'status', 'sunat_status',
    'sunat_response', 'sunat_sent_at', 'issued_at',
])]
class Receipt extends Model
{
    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'tax' => 'decimal:2',
            'total' => 'decimal:2',
            'sunat_response' => 'array',
            'sunat_sent_at' => 'datetime',
            'issued_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Bill, $this> */
    public function bill(): BelongsTo
    {
        return $this->belongsTo(Bill::class);
    }

    /** @return BelongsTo<Payment, $this> */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }
}
