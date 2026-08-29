<?php

use App\Models\Bill;
use App\Models\MenuCategory;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\RestaurantTable;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;

function authenticateApiWaiter(): User
{
    $waiter = User::factory()->create();
    Role::findOrCreate('mozo');
    $waiter->assignRole('mozo');
    Sanctum::actingAs($waiter, ['*']);

    return $waiter;
}

function apiBeverage(): Product
{
    $category = MenuCategory::create([
        'name' => 'Bebidas',
        'code' => 'beverages',
        'display_order' => 1,
        'active' => true,
    ]);
    $product = Product::create([
        'menu_category_id' => $category->id,
        'name' => 'Agua mineral',
        'price' => 4.50,
        'type' => 'simple',
        'status' => 'active',
    ]);
    ProductStock::create(['product_id' => $product->id, 'quantity' => 10]);

    return $product;
}

test('restaurant api endpoints require sanctum authentication', function (string $method, string $uri) {
    $this->json($method, $uri)->assertUnauthorized();
})->with([
    ['GET', '/api/dashboard'],
    ['GET', '/api/orders'],
    ['POST', '/api/orders/tables/1'],
    ['PATCH', '/api/orders/1/status'],
]);

test('authenticated users can retrieve dashboard metrics', function () {
    authenticateApiWaiter();
    RestaurantTable::create(['number' => 1, 'capacity' => 4, 'status' => 'occupied']);
    RestaurantTable::create(['number' => 2, 'capacity' => 2, 'status' => 'available']);

    $this->getJson(route('api.dashboard'))
        ->assertSuccessful()
        ->assertJsonPath('data.metrics.occupied_tables', 1)
        ->assertJsonPath('data.metrics.total_tables', 2)
        ->assertJsonStructure(['data' => ['metrics', 'recent_orders']]);
});

test('waiters can retrieve paginated orders', function () {
    $waiter = authenticateApiWaiter();
    $table = RestaurantTable::create(['number' => 3, 'capacity' => 4, 'status' => 'occupied']);
    $bill = Bill::create([
        'table_id' => $table->id,
        'opening_waiter_id' => $waiter->id,
        'order_type' => 'dine_in',
        'status' => 'open',
        'opened_at' => now(),
    ]);
    $order = Order::create(['bill_id' => $bill->id, 'user_id' => $waiter->id, 'status' => 'sent_to_kitchen']);

    $this->getJson(route('api.orders.index'))
        ->assertSuccessful()
        ->assertJsonPath('data.0.id', $order->id)
        ->assertJsonPath('data.0.bill.table.number', 3)
        ->assertJsonStructure(['data', 'links', 'meta']);
});

test('waiters can create an order for an available table', function () {
    $waiter = authenticateApiWaiter();
    $table = RestaurantTable::create(['number' => 4, 'capacity' => 4, 'status' => 'available']);
    $product = apiBeverage();

    $this->postJson(route('api.orders.tables.store', $table), [
        'customer_count' => 2,
        'product_id' => $product->id,
        'quantity' => 2,
    ])->assertCreated()
        ->assertJsonPath('data.waiter.id', $waiter->id)
        ->assertJsonPath('data.bill.table.number', 4)
        ->assertJsonPath('data.items.0.product.id', $product->id)
        ->assertJsonPath('data.items.0.quantity', 2);

    expect($table->fresh()->status)->toBe('occupied')
        ->and(ProductStock::where('product_id', $product->id)->value('quantity'))->toBe(8);
});

test('waiters can advance an order status without skipping states', function () {
    $waiter = authenticateApiWaiter();
    $bill = Bill::create([
        'opening_waiter_id' => $waiter->id,
        'order_type' => 'takeout',
        'status' => 'open',
        'opened_at' => now(),
    ]);
    $order = Order::create(['bill_id' => $bill->id, 'user_id' => $waiter->id, 'status' => 'sent_to_kitchen']);

    $this->patchJson(route('api.orders.update-status', $order), ['status' => 'completed'])
        ->assertSuccessful()
        ->assertJsonPath('data.status', 'completed');

    $this->patchJson(route('api.orders.update-status', $order), ['status' => 'sent_to_kitchen'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('status');
});

test('users without the waiter role cannot access order endpoints', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user, ['*']);

    $this->getJson(route('api.orders.index'))->assertForbidden();
});
