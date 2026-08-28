<?php

use App\Models\Bill;
use App\Models\DailyMenu;
use App\Models\MenuCategory;
use App\Models\MenuModality;
use App\Models\MenuSubcategory;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;

function createOrderForOrderItemTest(User $user, string $billStatus = 'open'): Order
{
    $bill = Bill::create([
        'opening_waiter_id' => $user->id,
        'order_type' => 'takeout',
        'status' => $billStatus,
        'opened_at' => now(),
        'closed_at' => $billStatus === 'closed' ? now() : null,
    ]);

    return Order::create([
        'bill_id' => $bill->id,
        'user_id' => $user->id,
        'status' => 'pendiente',
    ]);
}

function createActiveProductForOrderItemTest(): Product
{
    $category = MenuCategory::create([
        'name' => 'Comidas',
        'display_order' => 0,
        'has_versions' => false,
        'active' => true,
    ]);
    $subcategory = MenuSubcategory::create([
        'menu_category_id' => $category->id,
        'name' => 'Carta',
        'display_order' => 0,
        'active' => true,
    ]);

    return Product::create([
        'menu_category_id' => $category->id,
        'menu_subcategory_id' => $subcategory->id,
        'name' => 'Lomo saltado',
        'price' => 18.50,
        'type' => 'prepared',
        'status' => 'activo',
    ]);
}

function createActiveMenuModalityForOrderItemTest(): MenuModality
{
    $dailyMenu = DailyMenu::create([
        'date' => today(),
        'active' => true,
    ]);

    return MenuModality::create([
        'daily_menu_id' => $dailyMenu->id,
        'name' => 'Menú completo',
        'price' => 15.00,
        'active' => true,
    ]);
}

test('authenticated users can add an active product to an order', function () {
    $user = User::factory()->create();
    $order = createOrderForOrderItemTest($user);
    $product = createActiveProductForOrderItemTest();

    $this->actingAs($user)
        ->post(route('orders.items.store', $order), [
            'product_id' => $product->id,
            'quantity' => 2,
            'notes' => 'Sin picante',
        ])
        ->assertRedirect(route('orders.index'));

    expect(OrderItem::query()->count())->toBe(1);

    $item = OrderItem::firstOrFail();
    expect($item)
        ->product_id->toBe($product->id)
        ->quantity->toBe(2)
        ->unit_price->toBe('18.50')
        ->subtotal->toBe('37.00');
});

test('authenticated users can add an active menu modality to an order', function () {
    $user = User::factory()->create();
    $order = createOrderForOrderItemTest($user);
    $menuModality = createActiveMenuModalityForOrderItemTest();

    $this->actingAs($user)
        ->post(route('orders.items.store', $order), [
            'menu_modality_id' => $menuModality->id,
            'quantity' => 3,
        ])
        ->assertRedirect(route('orders.index'));

    $item = OrderItem::firstOrFail();
    expect($item)
        ->menu_modality_id->toBe($menuModality->id)
        ->product_id->toBeNull()
        ->subtotal->toBe('45.00');
});

test('an order item requires exactly one product origin', function () {
    $user = User::factory()->create();
    $order = createOrderForOrderItemTest($user);
    $product = createActiveProductForOrderItemTest();
    $menuModality = createActiveMenuModalityForOrderItemTest();

    $this->actingAs($user)
        ->from(route('orders.index'))
        ->post(route('orders.items.store', $order), [
            'product_id' => $product->id,
            'menu_modality_id' => $menuModality->id,
            'quantity' => 1,
        ])
        ->assertRedirect(route('orders.index'))
        ->assertSessionHasErrors(['product_id', 'menu_modality_id']);

    expect(OrderItem::query()->count())->toBe(0);
});

test('order items cannot be added to a closed bill', function () {
    $user = User::factory()->create();
    $order = createOrderForOrderItemTest($user, 'closed');
    $product = createActiveProductForOrderItemTest();

    $this->actingAs($user)
        ->from(route('orders.index'))
        ->post(route('orders.items.store', $order), [
            'product_id' => $product->id,
            'quantity' => 1,
        ])
        ->assertRedirect(route('orders.index'))
        ->assertSessionHasErrors('order');
});

test('order item kitchen status advances through its allowed states', function () {
    $user = User::factory()->create();
    $order = createOrderForOrderItemTest($user);
    $product = createActiveProductForOrderItemTest();
    $item = OrderItem::create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'quantity' => 1,
        'unit_price' => 18.50,
        'subtotal' => 18.50,
        'kitchen_status' => 'pendiente',
    ]);

    $this->actingAs($user)
        ->patch(route('order-items.update-kitchen-status', $item), [
            'kitchen_status' => 'en_preparacion',
        ])
        ->assertRedirect(route('orders.index'));

    $this->actingAs($user)
        ->patch(route('order-items.update-kitchen-status', $item), [
            'kitchen_status' => 'listo',
        ])
        ->assertRedirect(route('orders.index'));

    $this->actingAs($user)
        ->patch(route('order-items.update-kitchen-status', $item), [
            'kitchen_status' => 'entregado',
        ])
        ->assertRedirect(route('orders.index'));

    expect($item->refresh()->kitchen_status)->toBe('entregado');
});

test('authenticated users can delete pending order items', function () {
    $user = User::factory()->create();
    $order = createOrderForOrderItemTest($user);
    $product = createActiveProductForOrderItemTest();
    $item = OrderItem::create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'quantity' => 1,
        'unit_price' => 18.50,
        'subtotal' => 18.50,
        'kitchen_status' => 'pendiente',
    ]);

    $this->actingAs($user)
        ->delete(route('order-items.destroy', $item))
        ->assertRedirect(route('orders.index'));

    expect(OrderItem::query()->count())->toBe(0);
});
