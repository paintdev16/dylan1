<?php

namespace Database\Seeders;

use App\Models\Bill;
use App\Models\RestaurantTable;
use App\Models\User;
use Illuminate\Database\Seeder;

class BillsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $waiter = User::query()->firstOrFail();
        Bill::updateOrCreate(
            [
                'table_id' => null,
                'status' => 'closed',
                'order_type' => 'takeout',
            ],
            [
                'opening_waiter_id' => $waiter->id,
                'opened_at' => now()->subMinutes(20),
                'closed_at' => null,
            ]
        );
    }
}
