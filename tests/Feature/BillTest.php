<?php

use App\Models\Bill;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;

test('accounts cannot be opened or closed outside the command and cash flows', function () {
    expect(Route::has('bills.store'))->toBeFalse()
        ->and(Route::has('bills.close'))->toBeFalse()
        ->and(Route::has('bills.payments.store'))->toBeFalse();
});

test('the bills page shows the registered bills as read only history', function () {
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
