<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('bill_id')
                ->constrained('bills')
                ->restrictOnDelete();

            $table->foreignId('cashier_id')
                ->constrained('users')
                ->restrictOnDelete();

            $table->enum('payment_method', [
                'efectivo',
                'tarjeta',
                'yape',
                'plin',
            ]);

            $table->decimal('amount', 10, 2);

            $table->string('receipt_number')
                ->nullable()
                ->unique();

            $table->timestamps();
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('
                ALTER TABLE payments
                ADD CONSTRAINT chk_payments_amount
                CHECK (amount > 0)
            ');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
