<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('receipts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('bill_id')
                ->constrained('bills')
                ->restrictOnDelete();

            $table->foreignId('payment_id')
                ->constrained('payments')
                ->restrictOnDelete();

            $table->string('number')->unique();
            $table->string('receipt_type')->default('ticket');
            $table->string('customer_name')->default('Ninguno');
            $table->string('customer_document')->default('00000000');

            $table->decimal('subtotal', 10, 2);
            $table->decimal('tax', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            $table->string('currency', 3)->default('PEN');
            $table->string('payment_method');
            $table->string('operation_code')->nullable();
            $table->string('status')->default('issued');
            $table->string('sunat_status')->nullable();
            $table->json('sunat_response')->nullable();
            $table->timestamp('sunat_sent_at')->nullable();

            $table->timestamp('issued_at');

            $table->timestamps();

            $table->unique('bill_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('receipts');
    }
};
