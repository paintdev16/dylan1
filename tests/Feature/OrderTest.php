<?php

use App\Models\Bill;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Route;

function createOpenBill(User $user): Bill
{
    return Bill::create([
        'opening_waiter_id' => $user->id,
        'order_type' => 'takeout',
        'status' => 'open',
        'opened_at' => now(),
    ]);
}

test('legacy empty order creation and physical deletion routes are unavailable', function () {
    expect(Route::has('orders.store'))->toBeFalse()
        ->and(Route::has('orders.destroy'))->toBeFalse();
});

test('orders advance through their allowed statuses', function () {
    $user = User::factory()->create();
    $order = Order::create(['bill_id' => createOpenBill($user)->id, 'user_id' => $user->id, 'status' => 'pendiente']);

    $this->actingAs($user)->patch(route('orders.update-status', $order), ['status' => 'enviado_cocina'])->assertRedirect(route('orders.index'));
    $this->actingAs($user)->patch(route('orders.update-status', $order), ['status' => 'completado'])->assertRedirect(route('orders.index'));

    expect($order->refresh()->status)->toBe('completado');
});

test('orders cannot skip or reverse status transitions', function () {
    $user = User::factory()->create();
    $order = Order::create(['bill_id' => createOpenBill($user)->id, 'user_id' => $user->id, 'status' => 'pendiente']);

    $this->actingAs($user)
        ->from(route('orders.index'))
        ->patch(route('orders.update-status', $order), ['status' => 'completado'])
        ->assertRedirect(route('orders.index'))
        ->assertSessionHasErrors('status');

    expect($order->refresh()->status)->toBe('pendiente');
});

test('authenticated users can render orders index page', function () {
    $user = User::factory()->create();
    Order::create(['bill_id' => createOpenBill($user)->id, 'user_id' => $user->id, 'status' => 'pendiente']);

    $this->actingAs($user)->get(route('orders.index'))->assertOk();
});
