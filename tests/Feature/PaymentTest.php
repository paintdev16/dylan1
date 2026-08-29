<?php

use App\Models\Bill;
use App\Models\CashRegisterSession;
use App\Models\Payment;
use App\Models\RestaurantTable;
use App\Models\User;

test('authenticated users can register a partial payment for a bill', function () {
    $user = User::factory()->create();
    CashRegisterSession::create(['user_id' => $user->id, 'opening_amount' => 0, 'status' => 'open', 'opened_at' => now()]);
    $bill = Bill::create([
        'opening_waiter_id' => $user->id,
        'order_type' => 'takeout',
        'status' => 'open',
        'opened_at' => now(),
    ]);

    $order = $bill->orders()->create(['user_id' => $user->id, 'status' => 'pendiente']);
    $order->items()->create([
        'quantity' => 2,
        'unit_price' => 50.00,
        'subtotal' => 100.00,
        'kitchen_status' => 'pendiente',
    ]);

    $this->actingAs($user)
        ->post(route('cash-register.pay', $bill), [
            'payment_method' => 'efectivo',
            'amount' => 40.00,
            'receipt_number' => 'REC-001',
        ])
        ->assertRedirect(route('cash-register.index'));

    expect(Payment::query()->count())->toBe(1);

    $payment = Payment::firstOrFail();
    expect($payment)
        ->bill_id->toBe($bill->id)
        ->cashier_id->toBe($user->id)
        ->payment_method->toBe('efectivo')
        ->amount->toBe('40.00')
        ->receipt_number->toBe('REC-001');

    $bill->refresh();
    expect($bill)
        ->status->toBe('open')
        ->total_amount->toBe(100.00)
        ->paid_amount->toBe(40.00)
        ->balance->toBe(60.00);
});

test('paying the full balance automatically closes the bill and frees the table', function () {
    $user = User::factory()->create();
    CashRegisterSession::create(['user_id' => $user->id, 'opening_amount' => 0, 'status' => 'open', 'opened_at' => now()]);
    $table = RestaurantTable::create([
        'number' => 5,
        'capacity' => 4,
        'status' => 'occupied',
    ]);

    $bill = Bill::create([
        'table_id' => $table->id,
        'opening_waiter_id' => $user->id,
        'order_type' => 'dine_in',
        'status' => 'open',
        'opened_at' => now(),
    ]);

    $order = $bill->orders()->create(['user_id' => $user->id, 'status' => 'pendiente']);
    $order->items()->create([
        'quantity' => 1,
        'unit_price' => 75.50,
        'subtotal' => 75.50,
        'kitchen_status' => 'pendiente',
    ]);

    $this->actingAs($user)
        ->post(route('cash-register.pay', $bill), [
            'payment_method' => 'yape',
            'amount' => 75.50,
            'operation_code' => 'YAPE-9988',
            'receipt_number' => 'YAPE-9988',
        ])
        ->assertRedirect(route('cash-register.index'));

    $bill->refresh();
    expect($bill)
        ->status->toBe('closed')
        ->closed_at->not->toBeNull()
        ->balance->toBe(0.00);

    expect($table->refresh()->status)->toBe('available');
});

test('cannot pay an amount greater than the pending balance', function () {
    $user = User::factory()->create();
    CashRegisterSession::create(['user_id' => $user->id, 'opening_amount' => 0, 'status' => 'open', 'opened_at' => now()]);
    $bill = Bill::create([
        'opening_waiter_id' => $user->id,
        'order_type' => 'takeout',
        'status' => 'open',
        'opened_at' => now(),
    ]);

    $order = $bill->orders()->create(['user_id' => $user->id, 'status' => 'pendiente']);
    $order->items()->create([
        'quantity' => 1,
        'unit_price' => 30.00,
        'subtotal' => 30.00,
        'kitchen_status' => 'pendiente',
    ]);

    $this->actingAs($user)
        ->from(route('bills.index'))
        ->post(route('cash-register.pay', $bill), [
            'payment_method' => 'tarjeta',
            'amount' => 50.00,
            'operation_code' => 'POS-50',
        ])
        ->assertRedirect(route('bills.index'))
        ->assertSessionHasErrors('amount');

    expect(Payment::query()->count())->toBe(0);
});
