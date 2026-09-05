<?php

use App\Models\Bill;
use App\Models\MenuCategory;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\RestaurantTable;
use App\Models\User;
use Illuminate\Support\Str;
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
    ['POST', '/api/orders'],
    ['POST', '/api/orders/tables/1'],
    ['PATCH', '/api/orders/1/status'],
    ['DELETE', '/api/orders/1'],
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
    $completedOrder = Order::create(['bill_id' => $bill->id, 'user_id' => $waiter->id, 'status' => 'completed']);

    $this->getJson(route('api.orders.index', ['status' => 'sent_to_kitchen', 'table_id' => $table->id]))
        ->assertSuccessful()
        ->assertJsonPath('data.0.id', $order->id)
        ->assertJsonPath('data.0.bill.table.number', 3)
        ->assertJsonMissing(['id' => $completedOrder->id])
        ->assertJsonStructure([
            'data', 'links', 'meta', 'tables', 'products',
            'menu_modalities', 'daily_menu_products',
        ]);

    $this->getJson(route('api.orders.index', ['per_page' => 101]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('per_page');
});

test('waiters can create an order on an open bill', function () {
    $waiter = authenticateApiWaiter();
    $product = apiBeverage();
    $bill = Bill::create([
        'opening_waiter_id' => $waiter->id,
        'order_type' => 'takeout',
        'status' => 'open',
        'opened_at' => now(),
    ]);

    $this->postJson(route('api.orders.store'), [
        'bill_id' => $bill->id,
        'product_id' => $product->id,
        'quantity' => 2,
        'notes' => 'Sin hielo',
    ])->assertCreated()
        ->assertJsonPath('data.bill.id', $bill->id)
        ->assertJsonPath('data.waiter.id', $waiter->id)
        ->assertJsonPath('data.items.0.product.id', $product->id)
        ->assertJsonPath('data.items.0.kitchen_status', 'delivered')
        ->assertJsonPath('data.items.0.notes', 'Sin hielo');

    expect(ProductStock::where('product_id', $product->id)->value('quantity'))->toBe(8);
});

test('orders cannot be created on a closed bill', function () {
    $waiter = authenticateApiWaiter();
    $bill = Bill::create([
        'opening_waiter_id' => $waiter->id,
        'order_type' => 'takeout',
        'status' => 'closed',
        'opened_at' => now(),
        'closed_at' => now(),
    ]);

    $this->postJson(route('api.orders.store'), ['bill_id' => $bill->id])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('bill_id');

    expect(Order::query()->count())->toBe(0);
});

test('waiters can delete a pending order and restore its stock', function () {
    $waiter = authenticateApiWaiter();
    $product = apiBeverage();
    ProductStock::where('product_id', $product->id)->update(['quantity' => 8]);
    $bill = Bill::create([
        'opening_waiter_id' => $waiter->id,
        'order_type' => 'takeout',
        'status' => 'open',
        'opened_at' => now(),
    ]);
    $order = Order::create(['bill_id' => $bill->id, 'user_id' => $waiter->id, 'status' => 'sent_to_kitchen']);
    OrderItem::create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'quantity' => 2,
        'unit_price' => 4.50,
        'subtotal' => 9,
        'kitchen_status' => 'pending',
    ]);

    $this->deleteJson(route('api.orders.destroy', $order))->assertNoContent();

    $this->assertDatabaseMissing('orders', ['id' => $order->id]);
    expect(ProductStock::where('product_id', $product->id)->value('quantity'))->toBe(10);
});

test('orders with processed items cannot be deleted', function () {
    $waiter = authenticateApiWaiter();
    $product = apiBeverage();
    $bill = Bill::create([
        'opening_waiter_id' => $waiter->id,
        'order_type' => 'takeout',
        'status' => 'open',
        'opened_at' => now(),
    ]);
    $order = Order::create(['bill_id' => $bill->id, 'user_id' => $waiter->id, 'status' => 'sent_to_kitchen']);
    OrderItem::create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'quantity' => 1,
        'unit_price' => 4.50,
        'subtotal' => 4.50,
        'kitchen_status' => 'delivered',
    ]);

    $this->deleteJson(route('api.orders.destroy', $order))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('order');

    $this->assertDatabaseHas('orders', ['id' => $order->id]);
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

test('waiters can create a command with multiple items without root quantity', function () {
    authenticateApiWaiter();
    $table = RestaurantTable::create(['number' => 5, 'capacity' => 6, 'status' => 'available']);
    $product = apiBeverage();

    $this->postJson(route('api.orders.tables.store', $table), [
        'customer_count' => 4,
        'items' => [
            ['product_id' => $product->id, 'quantity' => 2],
            ['product_id' => $product->id, 'quantity' => 1, 'notes' => 'Sin hielo'],
        ],
    ])->assertCreated()
        ->assertJsonCount(2, 'data.items')
        ->assertJsonPath('data.items.1.notes', 'Sin hielo');

    expect(ProductStock::where('product_id', $product->id)->value('quantity'))->toBe(7)
        ->and(Order::query()->count())->toBe(1);
});

test('request token makes table order creation idempotent', function () {
    authenticateApiWaiter();
    $table = RestaurantTable::create(['number' => 6, 'capacity' => 4, 'status' => 'available']);
    $product = apiBeverage();
    $payload = [
        'customer_count' => 2,
        'request_token' => (string) Str::uuid(),
        'product_id' => $product->id,
        'quantity' => 2,
    ];

    $firstOrderId = $this->postJson(route('api.orders.tables.store', $table), $payload)
        ->assertCreated()
        ->json('data.id');
    $secondOrderId = $this->postJson(route('api.orders.tables.store', $table), $payload)
        ->assertSuccessful()
        ->assertOk()
        ->json('data.id');

    expect($secondOrderId)->toBe($firstOrderId)
        ->and(Order::query()->count())->toBe(1)
        ->and(ProductStock::where('product_id', $product->id)->value('quantity'))->toBe(8);
});

test('new consumption on an occupied table reuses its open bill', function () {
    authenticateApiWaiter();
    $table = RestaurantTable::create(['number' => 7, 'capacity' => 4, 'status' => 'available']);
    $product = apiBeverage();

    $firstBillId = $this->postJson(route('api.orders.tables.store', $table), [
        'customer_count' => 2,
        'product_id' => $product->id,
        'quantity' => 1,
    ])->assertCreated()->json('data.bill.id');

    $secondBillId = $this->postJson(route('api.orders.tables.store', $table), [
        'product_id' => $product->id,
        'quantity' => 1,
    ])->assertCreated()->json('data.bill.id');

    expect($secondBillId)->toBe($firstBillId)
        ->and(Bill::query()->count())->toBe(1)
        ->and(Order::query()->count())->toBe(2);
});

test('table order payload cannot mix root and items formats', function () {
    authenticateApiWaiter();
    $table = RestaurantTable::create(['number' => 8, 'capacity' => 4, 'status' => 'available']);
    $product = apiBeverage();

    $this->postJson(route('api.orders.tables.store', $table), [
        'customer_count' => 2,
        'product_id' => $product->id,
        'quantity' => 1,
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('items');

    expect(Order::query()->count())->toBe(0);
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
