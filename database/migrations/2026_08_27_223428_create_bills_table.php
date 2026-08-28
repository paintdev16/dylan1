<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('table_id')
                ->nullable()
                ->constrained('restaurant_tables')
                ->nullOnDelete();
            $table->foreignId('opening_waiter_id')
                ->constrained('users')
                ->restrictOnDelete();
            $table->enum('order_type', ['dine_in', 'takeout']);
            $table->enum('status', ['open', 'closed'])->default('open');
            $table->timestamp('opened_at')->useCurrent();
            $table->timestamp('closed_at')->nullable();
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement(
                "ALTER TABLE bills ADD CONSTRAINT chk_bills_order_type_table
                CHECK (
                    (order_type = 'dine_in' AND table_id IS NOT NULL)
                    OR (order_type = 'takeout' AND table_id IS NULL)
                )"
            );

            DB::statement(
                "CREATE UNIQUE INDEX bills_table_id_open_unique
                ON bills (table_id)
                WHERE status = 'open'"
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bills');
    }
};
