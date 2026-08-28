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
        Schema::table('order_items', function (Blueprint $table) {
            $table->boolean('is_cancelled')->default(false)->after('kitchen_status');
            $table->string('cancellation_reason')->nullable()->after('is_cancelled');
            $table->foreignId('cancelled_by')
                ->nullable()
                ->after('cancellation_reason')
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('cancelled_at')->nullable()->after('cancelled_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['cancelled_by']);
            $table->dropColumn(['is_cancelled', 'cancellation_reason', 'cancelled_by', 'cancelled_at']);
        });
    }
};
