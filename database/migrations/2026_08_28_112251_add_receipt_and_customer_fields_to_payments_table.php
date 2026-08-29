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
        Schema::table('payments', function (Blueprint $table) {
            $table->string('operation_code')->nullable()->after('amount');
            $table->string('receipt_type')->default('ticket')->after('operation_code');
            $table->string('customer_name')->nullable()->after('receipt_number');
            $table->string('customer_document')->nullable()->after('customer_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn([
                'operation_code',
                'receipt_type',
                'customer_name',
                'customer_document',
            ]);
        });
    }
};
