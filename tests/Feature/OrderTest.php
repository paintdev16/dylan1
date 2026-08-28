<?php

use App\Models\Bill;
use App\Models\Order;
use App\Models\User;

function createOpenBill(User $user): Bill
{
    return Bill::create([
        'opening_waiter_id' => $user->id,
        'order_type' => 'takeout',
        'status' => 'open',
        'opened_at' => now(),
    ]);
}

test('authenticated users can create a pending order for an open bill', function () {
    $user = User::factory()->create();
    $bill = createOpenBill($user);

    $this->actingAs($user)
        ->post(route('orders.store'), ['bill_id' => $bill->id])
        ->assertRedirect(route('orders.index'));

    expect(Order::query()->count())->toBe(1);
});

test('orders cannot be created for closed bills', function () {
    $user = User::factory()->create();
    $bill = Bill::create([
        'opening_waiter_id' => $user->id,
        'order_type' => 'takeout',
        'status' => 'closed',
        'opened_at' => now()->subHour(),
        'closed_at' => now(),
    ]);

    $this->actingAs($user)
        ->from(route('orders.index'))
        ->post(route('orders.store'), ['bill_id' => $bill->id])
        ->assertRedirect(route('orders.index'))
        ->assertSessionHasErrors('bill_id');

    expect(Order::query()->count())->toBe(0);
});

test('orders advance through their allowed statuses', function () {
    $user = User::factory()->create();
    $order = Order::create([
        'bill_id' => createOpenBill($user)->id,
        'user_id' => $user->id,
        'status' => 'pendiente',
    ]);

    $this->actingAs($user)
        ->patch(route('orders.update-status', $order), [
            'status' => 'enviado_cocina',
        ])
        ->assertRedirect(route('orders.index'));

    $this->actingAs($user)
        ->patch(route('orders.update-status', $order), [
            'status' => 'completado',
        ])
        ->assertRedirect(route('orders.index'));

    expect($order->refresh()->status)->toBe('completado');
});

test('orders cannot skip or reverse status transitions', function () {
    $user = User::factory()->create();
    $order = Order::create([
        'bill_id' => createOpenBill($user)->id,
        'user_id' => $user->id,
        'status' => 'pendiente',
    ]);

    $this->actingAs($user)
        ->from(route('orders.index'))
        ->patch(route('orders.update-status', $order), [
            'status' => 'completado',
        ])
        ->assertRedirect(route('orders.index'))
        ->assertSessionHasErrors('status');

    expect($order->refresh()->status)->toBe('pendiente');
});

test('authenticated users can delete pending orders', function () {
    $user = User::factory()->create();
    $order = Order::create([
        'bill_id' => createOpenBill($user)->id,
        'user_id' => $user->id,
        'status' => 'pendiente',
    ]);

    $this->actingAs($user)
        ->delete(route('orders.destroy', $order))
        ->assertRedirect(route('orders.index'));

    expect(Order::query()->count())->toBe(0);
});

test('authenticated users can render orders index page', function () {
    $user = User::factory()->create();
    $order = Order::create([
        'bill_id' => createOpenBill($user)->id,
        'user_id' => $user->id,
        'status' => 'pendiente',
    ]);

    $this->actingAs($user)
        ->get(route('orders.index'))
        ->assertOk();
});
