<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('restaurant_tables')
            ->whereIn('status', ['awaiting_payment', 'cleaning'])
            ->whereNotExists(function ($query): void {
                $query->selectRaw('1')
                    ->from('bills')
                    ->whereColumn('bills.table_id', 'restaurant_tables.id')
                    ->where('bills.status', 'open');
            })
            ->update(['status' => 'available', 'updated_at' => now()]);

        DB::table('restaurant_tables')
            ->whereIn('status', ['awaiting_payment', 'cleaning'])
            ->whereExists(function ($query): void {
                $query->selectRaw('1')
                    ->from('bills')
                    ->whereColumn('bills.table_id', 'restaurant_tables.id')
                    ->where('bills.status', 'open');
            })
            ->update(['status' => 'occupied', 'updated_at' => now()]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Los estados retirados no se restauran para evitar reintroducir bloqueos operativos.
    }
};
