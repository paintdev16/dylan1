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
            ->whereIn('status', ['reserved', 'occupied', 'awaiting_payment', 'cleaning'])
            ->whereNotExists(function ($query): void {
                $query->selectRaw('1')
                    ->from('table_sessions')
                    ->whereColumn('table_sessions.restaurant_table_id', 'restaurant_tables.id')
                    ->where('table_sessions.status', 'open');
            })
            ->whereNotExists(function ($query): void {
                $query->selectRaw('1')
                    ->from('bills')
                    ->whereColumn('bills.table_id', 'restaurant_tables.id')
                    ->where('bills.status', 'open');
            })
            ->update([
                'status' => 'available',
                'updated_at' => now(),
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Esta corrección de datos es intencionalmente irreversible: el estado previo era huérfano.
    }
};
