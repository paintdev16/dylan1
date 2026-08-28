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
        $occupiedTable = RestaurantTable::query()->where('number', 2)->firstOrFail();
        $paymentTable = RestaurantTable::query()->where('number', 7)->firstOrFail();

        Bill::updateOrCreate(
            [
                'table_id' => $occupiedTable->id,
                'status' => 'open',
            ],
            [
                'opening_waiter_id' => $waiter->id,
                'order_type' => 'dine_in',
                'opened_at' => now()->subMinutes(45),
                'closed_at' => null,
            ]
        );

        Bill::updateOrCreate(
            [
                'table_id' => $paymentTable->id,
                'status' => 'open',
            ],
            [
                'opening_waiter_id' => $waiter->id,
                'order_type' => 'dine_in',
                'opened_at' => now()->subMinutes(20),
                'closed_at' => null,
            ]
        );

        Bill::updateOrCreate(
            [
                'table_id' => null,
                'status' => 'closed',
                'order_type' => 'takeout',
            ],
            [
                'opening_waiter_id' => $waiter->id,
                'opened_at' => now()->subHours(2),
                'closed_at' => now()->subHour(),
            ]
        );
    }
}
