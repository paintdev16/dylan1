<?php

use App\Models\Bill;
use App\Models\CashRegisterSession;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\RestaurantTable;
use App\Models\TableSession;
use App\Models\User;

test('cashier can open a cash register session with opening amount', function () {
    $cashier = User::factory()->create(['name' => 'Mario Cajero']);

    $response = $this->actingAs($cashier)
        ->post(route('cash-register.open'), [
            'opening_amount' => 150.00,
        ]);

    $response->assertRedirect(route('cash-register.index'));

    $session = CashRegisterSession::where('user_id', $cashier->id)->first();
    expect($session)->not->toBeNull()
        ->and((float) $session->opening_amount)->toBe(150.00)
        ->and($session->status)->toBe('open');
});

test('payments are blocked when cashier does not have an open cash register session', function () {
    $cashier = User::factory()->create();
    $table = RestaurantTable::create(['number' => 20, 'capacity' => 4, 'status' => 'occupied']);
    $bill = Bill::create([
        'table_id' => $table->id,
        'opening_waiter_id' => $cashier->id,
        'order_type' => 'dine_in',
        'status' => 'open',
        'opened_at' => now(),
    ]);

    $this->actingAs($cashier)
        ->post(route('cash-register.pay', $bill), [
            'payment_method' => 'cash',
            'amount' => 20.00,
        ])
        ->assertSessionHasErrors('session');

    expect(Payment::count())->toBe(0);
});

test('cash payment accepts cent amounts and rejects insufficient received cash', function () {
    $cashier = User::factory()->create();
    CashRegisterSession::create([
        'user_id' => $cashier->id,
        'opening_amount' => 0,
        'status' => 'open',
        'opened_at' => now(),
    ]);
    $bill = Bill::create([
        'opening_waiter_id' => $cashier->id,
        'order_type' => 'takeout',
        'status' => 'open',
        'opened_at' => now(),
    ]);
    $order = Order::create(['bill_id' => $bill->id, 'user_id' => $cashier->id, 'status' => 'pending']);
    OrderItem::create(['order_id' => $order->id, 'quantity' => 1, 'unit_price' => 45.50, 'subtotal' => 45.50, 'kitchen_status' => 'pending']);

    $this->actingAs($cashier)
        ->post(route('cash-register.pay', $bill), [
            'payment_method' => 'cash',
            'amount' => 45.50,
            'received_amount' => 40,
        ])
        ->assertSessionHasErrors('received_amount');

    expect(Payment::query()->count())->toBe(0);

    $this->actingAs($cashier)
        ->post(route('cash-register.pay', $bill), [
            'payment_method' => 'cash',
            'amount' => 45.50,
            'received_amount' => 50,
        ])
        ->assertRedirect(route('cash-register.index'));

    expect((float) Payment::query()->firstOrFail()->amount)->toBe(45.5);
});

test('paying 100% of the bill automatically closes bill, table session, completes orders and frees table to available', function () {
    $cashier = User::factory()->create();
    $table = RestaurantTable::create(['number' => 21, 'capacity' => 4, 'status' => 'occupied']);

    // Abrir turno de caja
    $session = CashRegisterSession::create([
        'user_id' => $cashier->id,
        'opening_amount' => 100.00,
        'status' => 'open',
        'opened_at' => now(),
    ]);

    // Crear sesión de mesa
    $tableSession = TableSession::create([
        'restaurant_table_id' => $table->id,
        'waiter_id' => $cashier->id,
        'customer_count' => 2,
        'status' => 'open',
        'opened_at' => now(),
    ]);

    // Crear cuenta
    $bill = Bill::create([
        'table_session_id' => $tableSession->id,
        'table_id' => $table->id,
        'opening_waiter_id' => $cashier->id,
        'order_type' => 'dine_in',
        'status' => 'open',
        'opened_at' => now(),
    ]);

    // Crear orden con ítem de S/. 45.00
    $order = Order::create([
        'bill_id' => $bill->id,
        'user_id' => $cashier->id,
        'status' => 'sent_to_kitchen',
    ]);

    OrderItem::create([
        'order_id' => $order->id,
        'quantity' => 1,
        'unit_price' => 45.00,
        'subtotal' => 45.00,
        'kitchen_status' => 'ready',
    ]);

    expect((float) $bill->fresh()->balance)->toBe(45.00);

    // Registrar pago completo de S/. 45.00
    $response = $this->actingAs($cashier)
        ->post(route('cash-register.pay', $bill), [
            'payment_method' => 'cash',
            'amount' => 45.00,
            'received_amount' => 50.00,
        ]);

    $response->assertRedirect(route('cash-register.index'));

    // 1. Payment registrado
    $payment = Payment::first();
    expect($payment)->not->toBeNull()
        ->and((float) $payment->amount)->toBe(45.00)
        ->and($payment->cash_register_session_id)->toBe($session->id);

    // 2. Cuenta cerrada
    expect($bill->fresh()->status)->toBe('closed')
        ->and($bill->fresh()->closed_at)->not->toBeNull()
        ->and((float) $bill->fresh()->balance)->toBe(0.00);

    // 3. Sesión de mesa cerrada
    expect($tableSession->fresh()->status)->toBe('closed')
        ->and($tableSession->fresh()->closed_at)->not->toBeNull();

    // 4. Mesa liberada
    expect($table->fresh()->status)->toBe('available');

    // 5. Orden completada
    expect($order->fresh()->status)->toBe('completed');
});

test('cashier can close cash register session with physical count and difference calculation', function () {
    $cashier = User::factory()->create();

    $session = CashRegisterSession::create([
        'user_id' => $cashier->id,
        'opening_amount' => 100.00,
        'status' => 'open',
        'opened_at' => now(),
    ]);

    $table = RestaurantTable::create(['number' => 22, 'capacity' => 4, 'status' => 'occupied']);
    $bill = Bill::create([
        'table_id' => $table->id,
        'opening_waiter_id' => $cashier->id,
        'order_type' => 'dine_in',
        'status' => 'open',
        'opened_at' => now(),
    ]);

    // Pago 1 en efectivo S/. 30.00
    Payment::create([
        'cash_register_session_id' => $session->id,
        'bill_id' => $bill->id,
        'cashier_id' => $cashier->id,
        'payment_method' => 'cash',
        'amount' => 30.00,
    ]);

    // Pago 2 con tarjeta S/. 50.00 (no afecta efectivo en gaveta)
    Payment::create([
        'cash_register_session_id' => $session->id,
        'bill_id' => $bill->id,
        'cashier_id' => $cashier->id,
        'payment_method' => 'card',
        'amount' => 50.00,
    ]);

    // Efectivo esperado = 100 + 30 = 130.00. Contado = 132.50 (sobrante +2.50)
    $response = $this->actingAs($cashier)
        ->post(route('cash-register.close', $session), [
            'closing_amount' => 132.50,
            'notes' => 'Sobrante de monedas',
        ]);

    $response->assertRedirect(route('cash-register.index'));

    $freshSession = $session->fresh();
    expect($freshSession->status)->toBe('closed')
        ->and((float) $freshSession->closing_amount)->toBe(132.50)
        ->and((float) $freshSession->expected_amount)->toBe(130.00)
        ->and((float) $freshSession->difference)->toBe(2.50)
        ->and($freshSession->notes)->toBe('Sobrante de monedas');
});

test('cashier can split a payment across distinct methods and preserves the sale snapshot', function () {
    $cashier = User::factory()->create();
    CashRegisterSession::create(['user_id' => $cashier->id, 'opening_amount' => 0, 'status' => 'open', 'opened_at' => now()]);
    $bill = Bill::create(['opening_waiter_id' => $cashier->id, 'order_type' => 'takeout', 'status' => 'open', 'opened_at' => now()]);
    $order = Order::create(['bill_id' => $bill->id, 'user_id' => $cashier->id, 'status' => 'pending']);
    OrderItem::create(['order_id' => $order->id, 'quantity' => 1, 'unit_price' => 30, 'subtotal' => 30, 'kitchen_status' => 'pending']);

    $this->actingAs($cashier)->post(route('cash-register.pay', $bill), [
        'payments' => [
            ['payment_method' => 'cash', 'amount' => 10],
            ['payment_method' => 'yape', 'amount' => 20],
        ],
    ])->assertRedirect(route('cash-register.index'));

    expect(Payment::query()->count())->toBe(2)
        ->and(Payment::query()->distinct()->count('payment_group_id'))->toBe(1)
        ->and($bill->fresh()->status)->toBe('closed')
        ->and($bill->fresh()->sale_snapshot)->toBeArray()
        ->and($bill->fresh()->sale_snapshot[0]['items'][0]['subtotal'])->toBe('30.00');
});

test('manual cash movements are included in the expected closing amount', function () {
    $cashier = User::factory()->create();
    $session = CashRegisterSession::create(['user_id' => $cashier->id, 'opening_amount' => 100, 'status' => 'open', 'opened_at' => now()]);

    $this->actingAs($cashier)->post(route('cash-register.movements.store'), [
        'type' => 'income', 'amount' => 25, 'description' => 'Ingreso adicional',
    ])->assertRedirect();
    $this->actingAs($cashier)->post(route('cash-register.movements.store'), [
        'type' => 'expense', 'amount' => 10, 'description' => 'Compra menor',
    ])->assertRedirect();

    $this->actingAs($cashier)->post(route('cash-register.close', $session), [
        'closing_amount' => 115,
    ])->assertRedirect(route('cash-register.index'));

    expect((float) $session->fresh()->expected_amount)->toBe(115.0)
        ->and((float) $session->fresh()->difference)->toBe(0.0);
});
