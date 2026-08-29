<?php

use App\Models\Bill;
use App\Models\Payment;
use App\Models\User;
use Database\Seeders\PaymentsSeeder;

test('payments seeder generates a unique deterministic receipt for each bill', function () {
    $cashier = User::factory()->create();

    $closedBill = Bill::create([
        'opening_waiter_id' => $cashier->id,
        'order_type' => 'takeout',
        'status' => 'closed',
        'opened_at' => now()->subHour(),
        'closed_at' => now(),
    ]);
    $openBill = Bill::create([
        'opening_waiter_id' => $cashier->id,
        'order_type' => 'takeout',
        'status' => 'open',
        'opened_at' => now(),
    ]);

    $this->seed(PaymentsSeeder::class);
    $this->seed(PaymentsSeeder::class);

    expect(Payment::query()->count())->toBe(2)
        ->and(Payment::query()->distinct()->count('receipt_number'))->toBe(2)
        ->and($closedBill->payments()->value('receipt_number'))
        ->toBe(sprintf('B001-%05d', $closedBill->id))
        ->and($openBill->payments()->value('receipt_number'))
        ->toBe(sprintf('B001-%05d', $openBill->id))
        ->and($openBill->payments()->value('operation_code'))->toBe('YAPE-88291');
});
