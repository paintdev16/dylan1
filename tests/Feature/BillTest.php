<?php

use App\Models\Bill;
use App\Models\RestaurantTable;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('authenticated users can open a dine-in bill', function () {
    $user = User::factory()->create();
    $restaurantTable = RestaurantTable::create([
        'number' => 1,
        'capacity' => 4,
        'status' => 'available',
    ]);

    $this->actingAs($user)
        ->post(route('bills.store'), [
            'order_type' => 'dine_in',
            'table_id' => $restaurantTable->id,
        ])
        ->assertRedirect(route('bills.index'));

    $bill = Bill::query()->firstOrFail();

    expect($bill)
        ->table_id->toBe($restaurantTable->id)
        ->opening_waiter_id->toBe($user->id)
        ->order_type->toBe('dine_in')
        ->status->toBe('open');

    expect($restaurantTable->refresh()->status)->toBe('occupied');
});

test('authenticated users can open a takeout bill without a table', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('bills.store'), [
            'order_type' => 'takeout',
        ])
        ->assertRedirect(route('bills.index'));

    $bill = Bill::query()->firstOrFail();

    expect($bill)
        ->table_id->toBeNull()
        ->opening_waiter_id->toBe($user->id)
        ->order_type->toBe('takeout')
        ->status->toBe('open');
});

test('a takeout bill cannot have a restaurant table', function () {
    $user = User::factory()->create();
    $restaurantTable = RestaurantTable::create([
        'number' => 1,
        'capacity' => 4,
        'status' => 'available',
    ]);

    $this->actingAs($user)
        ->from(route('bills.index'))
        ->post(route('bills.store'), [
            'order_type' => 'takeout',
            'table_id' => $restaurantTable->id,
        ])
        ->assertRedirect(route('bills.index'))
        ->assertSessionHasErrors('table_id');

    expect(Bill::query()->count())->toBe(0);
});

test('closing a bill frees its restaurant table', function () {
    $user = User::factory()->create();
    $restaurantTable = RestaurantTable::create([
        'number' => 1,
        'capacity' => 4,
        'status' => 'occupied',
    ]);
    $bill = Bill::create([
        'table_id' => $restaurantTable->id,
        'opening_waiter_id' => $user->id,
        'order_type' => 'dine_in',
        'status' => 'open',
        'opened_at' => now(),
    ]);

    $this->actingAs($user)
        ->patch(route('bills.close', $bill))
        ->assertRedirect(route('bills.index'));

    expect($bill->refresh())
        ->status->toBe('closed')
        ->closed_at->not->toBeNull();

    expect($restaurantTable->refresh()->status)->toBe('available');
});

test('a bill with pending balance cannot be closed directly', function () {
    $user = User::factory()->create();
    $bill = Bill::create([
        'opening_waiter_id' => $user->id,
        'order_type' => 'takeout',
        'status' => 'open',
        'opened_at' => now(),
    ]);

    $order = $bill->orders()->create(['user_id' => $user->id, 'status' => 'pendiente']);
    $order->items()->create([
        'quantity' => 2,
        'unit_price' => 25.00,
        'subtotal' => 50.00,
        'kitchen_status' => 'pendiente',
    ]);

    $this->actingAs($user)
        ->from(route('bills.index'))
        ->patch(route('bills.close', $bill))
        ->assertRedirect(route('bills.index'))
        ->assertSessionHasErrors('bill');

    expect($bill->refresh()->status)->toBe('open');
});

test('the bills page shows the registered bills', function () {
    $user = User::factory()->create();
    $bill = Bill::create([
        'opening_waiter_id' => $user->id,
        'order_type' => 'takeout',
        'status' => 'open',
        'opened_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('bills.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('bills/index')
            ->has('bills', 1)
            ->where('bills.0.id', $bill->id));
});
