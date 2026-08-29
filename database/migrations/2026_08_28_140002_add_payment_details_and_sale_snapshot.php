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
            $table->uuid('payment_group_id')->nullable()->after('cash_register_session_id');
            $table->decimal('received_amount', 10, 2)->nullable()->after('amount');
            $table->decimal('change_amount', 10, 2)->default(0)->after('received_amount');
            $table->unique(['payment_group_id', 'payment_method']);
        });

        Schema::table('bills', function (Blueprint $table) {
            $table->json('sale_snapshot')->nullable();
            $table->foreignId('closed_by')->nullable()->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bills', function (Blueprint $table) {
            $table->dropConstrainedForeignId('closed_by');
            $table->dropColumn('sale_snapshot');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropUnique(['payment_group_id', 'payment_method']);
            $table->dropColumn(['payment_group_id', 'received_amount', 'change_amount']);
        });
    }
};
