<?php

use App\Models\Bill;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('dashboard counts only active kitchen items from open bills', function () {
    $user = User::factory()->create();

    $openBill = Bill::create([
        'opening_waiter_id' => $user->id,
        'order_type' => 'takeout',
        'status' => 'open',
        'opened_at' => now(),
    ]);
    $closedBill = Bill::create([
        'opening_waiter_id' => $user->id,
        'order_type' => 'takeout',
        'status' => 'closed',
        'opened_at' => now()->subHour(),
        'closed_at' => now(),
    ]);

    $openOrder = Order::create(['bill_id' => $openBill->id, 'user_id' => $user->id]);
    $closedOrder = Order::create(['bill_id' => $closedBill->id, 'user_id' => $user->id]);

    OrderItem::create([
        'order_id' => $openOrder->id,
        'quantity' => 1,
        'unit_price' => 10,
        'subtotal' => 10,
        'kitchen_status' => 'pending',
    ]);
    OrderItem::create([
        'order_id' => $openOrder->id,
        'quantity' => 1,
        'unit_price' => 10,
        'subtotal' => 10,
        'kitchen_status' => 'pending',
        'is_cancelled' => true,
    ]);
    OrderItem::create([
        'order_id' => $closedOrder->id,
        'quantity' => 1,
        'unit_price' => 10,
        'subtotal' => 10,
        'kitchen_status' => 'in_preparation',
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('metrics.pending_kitchen_items', 1));
});
