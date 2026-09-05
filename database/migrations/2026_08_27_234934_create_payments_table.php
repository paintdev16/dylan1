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
            $table->foreignId('cash_register_session_id')
                ->nullable()
                ->constrained('cash_register_sessions')
                ->nullOnDelete();
            $table->uuid('payment_group_id')->nullable();

            $table->enum('payment_method', [
                'cash',
                'card',
                'yape',
                'plin',
            ]);

            $table->decimal('amount', 10, 2);
            $table->decimal('received_amount', 10, 2)->nullable();
            $table->decimal('change_amount', 10, 2)->default(0);

            $table->string('receipt_number')
                ->nullable()
                ->unique();
            $table->string('operation_code')->nullable();
            $table->string('receipt_type')->default('ticket');
            $table->string('customer_name')->nullable();
            $table->string('customer_document')->nullable();

            $table->timestamps();

            $table->unique(['payment_group_id', 'payment_method']);
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
