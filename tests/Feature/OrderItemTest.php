<?php

use App\Models\Bill;
use App\Models\DailyMenu;
use App\Models\DailyMenuProduct;
use App\Models\MenuCategory;
use App\Models\MenuModality;
use App\Models\MenuModalityItem;
use App\Models\MenuSubcategory;
use App\Models\MenuSubcategoryType;
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
        'status' => 'pending',
    ]);
}

function createActiveProductForOrderItemTest(): Product
{
    $category = MenuCategory::firstOrCreate(
        ['name' => 'Comidas'],
        ['display_order' => 0, 'has_versions' => false, 'active' => true]
    );
    $subcategory = MenuSubcategory::firstOrCreate(
        ['name' => 'Carta', 'menu_category_id' => $category->id],
        ['display_order' => 0, 'active' => true]
    );

    $product = Product::create([
        'menu_category_id' => $category->id,
        'menu_subcategory_id' => $subcategory->id,
        'name' => 'Lomo saltado',
        'price' => 18.50,
        'type' => 'prepared',
        'status' => 'active',
    ]);

    $dailyMenu = DailyMenu::query()->whereDate('date', now('America/Lima')->toDateString())->first()
        ?? DailyMenu::create(['date' => now('America/Lima')->toDateString(), 'active' => true]);
    DailyMenuProduct::firstOrCreate(
        ['daily_menu_id' => $dailyMenu->id, 'product_id' => $product->id],
        ['price' => 18.50, 'quantity_available' => 20, 'display_order' => 1, 'active' => true]
    );

    return $product;
}

function createActiveMenuModalityForOrderItemTest(): array
{
    $category = MenuCategory::firstOrCreate(
        ['name' => 'Comidas'],
        ['display_order' => 1, 'active' => true]
    );
    $subcategory = MenuSubcategory::firstOrCreate(
        ['name' => 'Menú Económico', 'menu_category_id' => $category->id],
        ['display_order' => 1, 'active' => true]
    );
    $typeSegundo = MenuSubcategoryType::firstOrCreate(
        ['name' => 'Segundos', 'menu_subcategory_id' => $subcategory->id],
        ['display_order' => 1, 'active' => true]
    );
    $typeEntrada = MenuSubcategoryType::firstOrCreate(
        ['name' => 'Entradas', 'menu_subcategory_id' => $subcategory->id],
        ['display_order' => 2, 'active' => true]
    );
    $typePostre = MenuSubcategoryType::firstOrCreate(
        ['name' => 'Postres', 'menu_subcategory_id' => $subcategory->id],
        ['display_order' => 3, 'active' => true]
    );

    $pSegundo = Product::create(['menu_category_id' => $category->id, 'menu_subcategory_id' => $subcategory->id, 'menu_subcategory_type_id' => $typeSegundo->id, 'name' => 'Seco de Pollo', 'price' => 15.00, 'type' => 'prepared', 'status' => 'active']);
    $pEntrada = Product::create(['menu_category_id' => $category->id, 'menu_subcategory_id' => $subcategory->id, 'menu_subcategory_type_id' => $typeEntrada->id, 'name' => 'Sopa', 'price' => 3.00, 'type' => 'prepared', 'status' => 'active']);
    $pPostre = Product::create(['menu_category_id' => $category->id, 'menu_subcategory_id' => $subcategory->id, 'menu_subcategory_type_id' => $typePostre->id, 'name' => 'Flan', 'price' => 2.00, 'type' => 'prepared', 'status' => 'active']);

    $todayDate = now('America/Lima')->toDateString();
    $dailyMenu = DailyMenu::query()->whereDate('date', $todayDate)->first()
        ?? DailyMenu::create(['date' => $todayDate, 'active' => true]);

    $dmpSegundo = DailyMenuProduct::create(['daily_menu_id' => $dailyMenu->id, 'product_id' => $pSegundo->id, 'price' => 15.00, 'quantity_available' => 10, 'display_order' => 1, 'active' => true]);
    $dmpEntrada = DailyMenuProduct::create(['daily_menu_id' => $dailyMenu->id, 'product_id' => $pEntrada->id, 'price' => 3.00, 'quantity_available' => 10, 'display_order' => 2, 'active' => true]);
    $dmpPostre = DailyMenuProduct::create(['daily_menu_id' => $dailyMenu->id, 'product_id' => $pPostre->id, 'price' => 2.00, 'quantity_available' => 10, 'display_order' => 3, 'active' => true]);

    $modality = MenuModality::create([
        'daily_menu_id' => $dailyMenu->id,
        'code' => 'full_menu',
        'name' => 'Menú completo',
        'price' => 15.00,
        'active' => true,
    ]);

    MenuModalityItem::create(['menu_modality_id' => $modality->id, 'daily_menu_product_id' => $dmpSegundo->id, 'item_type' => 'main_course']);
    MenuModalityItem::create(['menu_modality_id' => $modality->id, 'daily_menu_product_id' => $dmpEntrada->id, 'item_type' => 'starter']);
    MenuModalityItem::create(['menu_modality_id' => $modality->id, 'daily_menu_product_id' => $dmpPostre->id, 'item_type' => 'dessert']);

    return [
        'modality' => $modality,
        'components' => [$dmpSegundo->id, $dmpEntrada->id, $dmpPostre->id],
    ];
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
    $modalityData = createActiveMenuModalityForOrderItemTest();

    $this->actingAs($user)
        ->post(route('orders.items.store', $order), [
            'menu_modality_id' => $modalityData['modality']->id,
            'components' => $modalityData['components'],
            'quantity' => 3,
        ])
        ->assertRedirect(route('orders.index'));

    $item = OrderItem::firstOrFail();
    expect($item)
        ->menu_modality_id->toBe($modalityData['modality']->id)
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
            'menu_modality_id' => $menuModality['modality']->id,
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
        'kitchen_status' => 'pending',
    ]);

    $this->actingAs($user)
        ->patch(route('order-items.update-kitchen-status', $item), [
            'kitchen_status' => 'in_preparation',
        ])
        ->assertRedirect(route('orders.index'));

    $this->actingAs($user)
        ->patch(route('order-items.update-kitchen-status', $item), [
            'kitchen_status' => 'delivered',
        ])
        ->assertRedirect(route('orders.index'));

    expect($item->refresh()->kitchen_status)->toBe('delivered');
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
        'kitchen_status' => 'pending',
    ]);

    $this->actingAs($user)
        ->post(route('order-items.cancel', $item), [
            'cancellation_reason' => 'El cliente retiró el consumo',
        ])
        ->assertRedirect(route('orders.index'));

    expect(OrderItem::query()->count())->toBe(1)
        ->and($item->fresh()->is_cancelled)->toBeTrue();
});
