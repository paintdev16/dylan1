<?php

use App\Models\Bill;
use App\Models\RestaurantTable;
use App\Models\TableSession;
use App\Models\User;

test('waiter can open an available table creating session and bill atomically', function () {
    $waiter = User::factory()->create(['name' => 'Carlos Mozo']);
    $table = RestaurantTable::create([
        'number' => 5,
        'capacity' => 4,
        'status' => 'available',
    ]);

    $response = $this->actingAs($waiter)
        ->post(route('tables.open-session', $table), [
            'customer_count' => 3,
        ]);

    $response->assertRedirect(route('tables.index'));

    // Verify table is occupied
    expect($table->fresh()->status)->toBe('occupied');

    // Verify table session
    $session = TableSession::where('restaurant_table_id', $table->id)->first();
    expect($session)->not->toBeNull()
        ->and($session->waiter_id)->toBe($waiter->id)
        ->and($session->customer_count)->toBe(3)
        ->and($session->status)->toBe('open');

    // Verify bill
    $bill = Bill::where('table_id', $table->id)->first();
    expect($bill)->not->toBeNull()
        ->and($bill->table_session_id)->toBe($session->id)
        ->and($bill->opening_waiter_id)->toBe($waiter->id)
        ->and($bill->order_type)->toBe('dine_in')
        ->and($bill->status)->toBe('open')
        ->and((float) $bill->total_amount)->toBe(0.00);
});

test('cannot open a table that is already occupied', function () {
    $waiter = User::factory()->create();
    $table = RestaurantTable::create([
        'number' => 6,
        'capacity' => 4,
        'status' => 'occupied',
    ]);

    $this->actingAs($waiter)
        ->from(route('tables.index'))
        ->post(route('tables.open-session', $table), [
            'customer_count' => 2,
        ])
        ->assertRedirect(route('tables.index'))
        ->assertSessionHasErrors('table');

    expect(TableSession::where('restaurant_table_id', $table->id)->count())->toBe(0);
});

test('cannot open a table that is out of service', function () {
    $waiter = User::factory()->create();
    $table = RestaurantTable::create([
        'number' => 7,
        'capacity' => 2,
        'status' => 'out_of_service',
    ]);

    $this->actingAs($waiter)
        ->from(route('tables.index'))
        ->post(route('tables.open-session', $table), [
            'customer_count' => 2,
        ])
        ->assertRedirect(route('tables.index'))
        ->assertSessionHasErrors('table');

    expect(TableSession::where('restaurant_table_id', $table->id)->count())->toBe(0);
});

test('opening a table requires a valid customer count', function () {
    $waiter = User::factory()->create();
    $table = RestaurantTable::create([
        'number' => 8,
        'capacity' => 4,
        'status' => 'available',
    ]);

    $this->actingAs($waiter)
        ->from(route('tables.index'))
        ->post(route('tables.open-session', $table), [
            'customer_count' => 0,
        ])
        ->assertRedirect(route('tables.index'))
        ->assertSessionHasErrors('customer_count');

    expect($table->fresh()->status)->toBe('available')
        ->and(TableSession::count())->toBe(0);
});

test('tables index renders active session and waiter details', function () {
    $waiter = User::factory()->create(['name' => 'Ana Mesera']);
    $table = RestaurantTable::create([
        'number' => 9,
        'capacity' => 4,
        'status' => 'occupied',
    ]);

    $session = TableSession::create([
        'restaurant_table_id' => $table->id,
        'waiter_id' => $waiter->id,
        'customer_count' => 4,
        'status' => 'open',
        'opened_at' => now(),
    ]);

    Bill::create([
        'table_session_id' => $session->id,
        'table_id' => $table->id,
        'opening_waiter_id' => $waiter->id,
        'order_type' => 'dine_in',
        'status' => 'open',
        'opened_at' => now(),
    ]);

    $this->actingAs($waiter)
        ->get(route('tables.index'))
        ->assertOk();

    expect($table->fresh()->activeSession)->not->toBeNull()
        ->and($table->fresh()->activeSession->waiter->name)->toBe('Ana Mesera');
});
