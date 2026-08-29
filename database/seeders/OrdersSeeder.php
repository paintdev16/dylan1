<?php

namespace Database\Seeders;

use App\Models\Bill;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrdersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::query()->firstOrFail();
        $bills = Bill::query()
            ->where('status', 'open')
            ->orderBy('id')
            ->take(2)
            ->get();

        foreach ($bills as $index => $bill) {
            Order::updateOrCreate(
                [
                    'bill_id' => $bill->id,
                    'status' => $index === 0 ? 'pending' : 'sent_to_kitchen',
                ],
                [
                    'user_id' => $user->id,
                ]
            );
        }
    }
}
