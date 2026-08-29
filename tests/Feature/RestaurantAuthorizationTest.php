<?php

use App\Models\RestaurantTable;
use App\Models\User;
use Database\Seeders\RolesPermissionsSeeder;

beforeEach(function () {
    $this->seed(RolesPermissionsSeeder::class);
});

test('a waiter cannot access cash register or kitchen', function () {
    $waiter = User::factory()->create();
    $waiter->assignRole('mozo');

    $this->actingAs($waiter)->get(route('cash-register.index'))->assertForbidden();
    $this->actingAs($waiter)->get(route('kitchen.index'))->assertForbidden();
});

test('kitchen staff cannot access cash register or administration', function () {
    $kitchenUser = User::factory()->create();
    $kitchenUser->assignRole('cocina');

    $this->actingAs($kitchenUser)->get(route('cash-register.index'))->assertForbidden();
    $this->actingAs($kitchenUser)->get(route('products.index'))->assertForbidden();
});

test('a cashier cannot modify the menu or orders', function () {
    $cashier = User::factory()->create();
    $cashier->assignRole('cajero');

    $this->actingAs($cashier)->get(route('daily-menu.index'))->assertForbidden();
    $this->actingAs($cashier)->get(route('orders.index'))->assertForbidden();
});

test('an administrator can access every restaurant module', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('admin');

    $this->actingAs($administrator)->get(route('cash-register.index'))->assertOk();
    $this->actingAs($administrator)->get(route('kitchen.index'))->assertOk();
    $this->actingAs($administrator)->get(route('reports.index'))->assertOk();
});

test('only a super administrator can restore an out of service table', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('admin');
    $superAdministrator = User::factory()->create();
    $superAdministrator->assignRole('super-admin');
    $table = RestaurantTable::create([
        'number' => 90,
        'capacity' => 4,
        'status' => 'out_of_service',
    ]);

    $this->actingAs($administrator)
        ->patch(route('tables.status', $table), ['status' => 'available'])
        ->assertForbidden();

    expect($table->fresh()->status)->toBe('out_of_service');

    $this->actingAs($superAdministrator)
        ->patch(route('tables.status', $table), ['status' => 'available'])
        ->assertRedirect(route('tables.index'));

    expect($table->fresh()->status)->toBe('available');
});
