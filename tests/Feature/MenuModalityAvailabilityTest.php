<?php

use App\Models\Bill;
use App\Models\CancellationRequest;
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
use App\Models\ProductStock;
use App\Models\RestaurantTable;
use App\Models\User;
use Database\Seeders\MenuModalityItemsSeeder;

function setupDailyMenuWithComponents(): array
{
    $category = MenuCategory::create(['name' => 'Comidas', 'display_order' => 1, 'active' => true]);
    $beverageCategory = MenuCategory::create(['name' => 'Bebidas', 'display_order' => 2, 'active' => true]);

    $subEconomic = MenuSubcategory::create([
        'menu_category_id' => $category->id,
        'name' => 'Menú Económico',
        'display_order' => 1,
        'active' => true,
    ]);

    $typeSegundo = MenuSubcategoryType::create([
        'menu_subcategory_id' => $subEconomic->id,
        'name' => 'Segundos',
        'display_order' => 1,
        'active' => true,
    ]);

    $typeEntrada = MenuSubcategoryType::create([
        'menu_subcategory_id' => $subEconomic->id,
        'name' => 'Entradas',
        'display_order' => 2,
        'active' => true,
    ]);

    $typePostre = MenuSubcategoryType::create([
        'menu_subcategory_id' => $subEconomic->id,
        'name' => 'Postres',
        'display_order' => 3,
        'active' => true,
    ]);

    $pSegundo = Product::create([
        'menu_category_id' => $category->id,
        'menu_subcategory_id' => $subEconomic->id,
        'menu_subcategory_type_id' => $typeSegundo->id,
        'name' => 'Seco de pollo',
        'type' => 'prepared',
        'status' => 'active',
        'price' => 14.00,
    ]);

    $pEntrada = Product::create([
        'menu_category_id' => $category->id,
        'menu_subcategory_id' => $subEconomic->id,
        'menu_subcategory_type_id' => $typeEntrada->id,
        'name' => 'Sopa de verduras',
        'type' => 'prepared',
        'status' => 'active',
        'price' => 4.00,
    ]);

    $pPostre = Product::create([
        'menu_category_id' => $category->id,
        'menu_subcategory_id' => $subEconomic->id,
        'menu_subcategory_type_id' => $typePostre->id,
        'name' => 'Gelatina',
        'type' => 'prepared',
        'status' => 'active',
        'price' => 3.00,
    ]);

    $pBeverage = Product::create([
        'menu_category_id' => $beverageCategory->id,
        'name' => 'Inca Kola 500ml',
        'type' => 'simple',
        'status' => 'active',
        'price' => 4.50,
    ]);

    ProductStock::create([
        'product_id' => $pBeverage->id,
        'quantity' => 20,
    ]);

    $todayDate = now('America/Lima')->toDateString();
    $dailyMenu = DailyMenu::create([
        'date' => $todayDate,
        'active' => true,
    ]);

    $dmpSegundo = DailyMenuProduct::create([
        'daily_menu_id' => $dailyMenu->id,
        'product_id' => $pSegundo->id,
        'price' => 14.00,
        'quantity_available' => 10,
        'display_order' => 1,
        'active' => true,
    ]);

    $dmpEntrada = DailyMenuProduct::create([
        'daily_menu_id' => $dailyMenu->id,
        'product_id' => $pEntrada->id,
        'price' => 4.00,
        'quantity_available' => 10,
        'display_order' => 2,
        'active' => true,
    ]);

    $dmpPostre = DailyMenuProduct::create([
        'daily_menu_id' => $dailyMenu->id,
        'product_id' => $pPostre->id,
        'price' => 3.00,
        'quantity_available' => 10,
        'display_order' => 3,
        'active' => true,
    ]);

    $modalityCompleto = MenuModality::create([
        'daily_menu_id' => $dailyMenu->id,
        'code' => 'full_menu',
        'name' => 'Menú completo',
        'description' => 'Segundo + entrada + postre.',
        'price' => 14.00,
        'display_order' => 1,
        'active' => true,
    ]);

    $modalitySoloSegundo = MenuModality::create([
        'daily_menu_id' => $dailyMenu->id,
        'code' => 'main_only',
        'name' => 'Solo segundo',
        'description' => 'Solo segundo.',
        'price' => 9.00,
        'display_order' => 2,
        'active' => true,
    ]);

    $modalityEntradaPostre = MenuModality::create([
        'daily_menu_id' => $dailyMenu->id,
        'code' => 'starter_dessert',
        'name' => 'Entrada + postre',
        'description' => 'Entrada y postre.',
        'price' => 5.00,
        'display_order' => 3,
        'active' => true,
    ]);

    foreach ([
        [$modalityCompleto, $dmpSegundo, 'main_course'],
        [$modalityCompleto, $dmpEntrada, 'starter'],
        [$modalityCompleto, $dmpPostre, 'dessert'],
        [$modalitySoloSegundo, $dmpSegundo, 'main_course'],
        [$modalityEntradaPostre, $dmpEntrada, 'starter'],
        [$modalityEntradaPostre, $dmpPostre, 'dessert'],
    ] as [$modality, $dailyMenuProduct, $itemType]) {
        MenuModalityItem::create([
            'menu_modality_id' => $modality->id,
            'daily_menu_product_id' => $dailyMenuProduct->id,
            'item_type' => $itemType,
        ]);
    }

    return compact(
        'dailyMenu',
        'dmpSegundo',
        'dmpEntrada',
        'dmpPostre',
        'modalityCompleto',
        'modalitySoloSegundo',
        'modalityEntradaPostre',
        'pBeverage'
    );
}

test('visiting daily menu products initializes the 3 default modalities', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('daily-menu-products.index'))
        ->assertOk();

    $dailyMenu = DailyMenu::first();

    expect($dailyMenu)->not->toBeNull()
        ->and($dailyMenu->menuModalities()->count())->toBe(3)
        ->and($dailyMenu->menuModalities()->pluck('name')->all())
        ->toContain('Menú completo', 'Solo segundo', 'Entrada + postre');
});

test('modality item seeder links every eligible product by stable component code', function () {
    $data = setupDailyMenuWithComponents();

    MenuModalityItem::query()->delete();

    $this->seed(MenuModalityItemsSeeder::class);

    expect($data['modalityCompleto']->items()->count())->toBe(3)
        ->and($data['modalitySoloSegundo']->items()->count())->toBe(1)
        ->and($data['modalityEntradaPostre']->items()->count())->toBe(2)
        ->and($data['modalityCompleto']->items()->pluck('item_type')->all())
        ->toContain('main_course', 'starter', 'dessert');
});

test('admin can update modality price and active status', function () {
    $data = setupDailyMenuWithComponents();
    $user = User::factory()->create();

    $this->actingAs($user)
        ->put(route('daily-menu-modalities.update', $data['modalityCompleto']), [
            'price' => 16.50,
            'description' => 'Menú completo ejecutivo premium.',
            'active' => false,
        ])
        ->assertRedirect();

    $fresh = $data['modalityCompleto']->fresh();
    expect((float) $fresh->price)->toBe(16.50)
        ->and($fresh->active)->toBeFalse();
});

test('waiter can create an order item with Menu completo and components deducting portions atomically', function () {
    $data = setupDailyMenuWithComponents();
    $user = User::factory()->create();

    $table = RestaurantTable::create(['number' => 1, 'capacity' => 4, 'status' => 'occupied']);
    $bill = Bill::create([
        'restaurant_table_id' => $table->id,
        'opening_waiter_id' => $user->id,
        'order_type' => 'dine_in',
        'status' => 'open',
        'opened_at' => now(),
        'total_amount' => 0,
        'paid_amount' => 0,
        'balance' => 0,
    ]);

    $order = Order::create([
        'bill_id' => $bill->id,
        'user_id' => $user->id,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($user)
        ->post(route('orders.items.store', $order), [
            'menu_modality_id' => $data['modalityCompleto']->id,
            'components' => [
                $data['dmpSegundo']->id,
                $data['dmpEntrada']->id,
                $data['dmpPostre']->id,
            ],
            'quantity' => 2,
        ]);

    $response->assertRedirect(route('orders.index'));

    // Check order item created with components
    $item = OrderItem::first();
    expect($item)->not->toBeNull()
        ->and($item->menu_modality_id)->toBe($data['modalityCompleto']->id)
        ->and($item->quantity)->toBe(2)
        ->and((float) $item->subtotal)->toBe(28.00)
        ->and($item->dailyMenuProducts()->count())->toBe(3);

    // Check portions deducted
    expect($data['dmpSegundo']->fresh()->quantity_available)->toBe(8);
});

test('order item creation fails when modality components are incomplete or wrong type', function () {
    $data = setupDailyMenuWithComponents();
    $user = User::factory()->create();

    $table = RestaurantTable::create(['number' => 2, 'capacity' => 4, 'status' => 'occupied']);
    $bill = Bill::create([
        'restaurant_table_id' => $table->id,
        'opening_waiter_id' => $user->id,
        'order_type' => 'dine_in',
        'status' => 'open',
        'opened_at' => now(),
        'total_amount' => 0,
        'paid_amount' => 0,
        'balance' => 0,
    ]);

    $order = Order::create([
        'bill_id' => $bill->id,
        'user_id' => $user->id,
        'status' => 'pending',
    ]);

    // Intenta pedir Menú completo sin postre (solo segundo y entrada)
    $this->actingAs($user)
        ->post(route('orders.items.store', $order), [
            'menu_modality_id' => $data['modalityCompleto']->id,
            'components' => [
                $data['dmpSegundo']->id,
                $data['dmpEntrada']->id,
            ],
            'quantity' => 1,
        ])
        ->assertSessionHasErrors('components');
});

test('order item creation fails when available portions are insufficient', function () {
    $data = setupDailyMenuWithComponents();
    $user = User::factory()->create();

    $table = RestaurantTable::create(['number' => 3, 'capacity' => 4, 'status' => 'occupied']);
    $bill = Bill::create([
        'restaurant_table_id' => $table->id,
        'opening_waiter_id' => $user->id,
        'order_type' => 'dine_in',
        'status' => 'open',
        'opened_at' => now(),
        'total_amount' => 0,
        'paid_amount' => 0,
        'balance' => 0,
    ]);

    $order = Order::create([
        'bill_id' => $bill->id,
        'user_id' => $user->id,
        'status' => 'pending',
    ]);

    // Pedir 15 porciones cuando solo hay 10
    $this->actingAs($user)
        ->post(route('orders.items.store', $order), [
            'menu_modality_id' => $data['modalitySoloSegundo']->id,
            'components' => [
                $data['dmpSegundo']->id,
            ],
            'quantity' => 15,
        ])
        ->assertSessionHasErrors('components');
});

test('deleting an order item restores portions and beverage stock', function () {
    $data = setupDailyMenuWithComponents();
    $user = User::factory()->create();

    $table = RestaurantTable::create(['number' => 4, 'capacity' => 4, 'status' => 'occupied']);
    $bill = Bill::create([
        'restaurant_table_id' => $table->id,
        'opening_waiter_id' => $user->id,
        'order_type' => 'dine_in',
        'status' => 'open',
        'opened_at' => now(),
        'total_amount' => 0,
        'paid_amount' => 0,
        'balance' => 0,
    ]);

    $order = Order::create([
        'bill_id' => $bill->id,
        'user_id' => $user->id,
        'status' => 'pending',
    ]);

    // 1. Pedir modalidad y bebida
    $this->actingAs($user)
        ->post(route('orders.items.store', $order), [
            'menu_modality_id' => $data['modalityCompleto']->id,
            'components' => [
                $data['dmpSegundo']->id,
                $data['dmpEntrada']->id,
                $data['dmpPostre']->id,
            ],
            'quantity' => 3,
        ]);

    $this->actingAs($user)
        ->post(route('orders.items.store', $order), [
            'product_id' => $data['pBeverage']->id,
            'quantity' => 4,
        ]);

    expect($data['dmpSegundo']->fresh()->quantity_available)->toBe(7)
        ->and(ProductStock::where('product_id', $data['pBeverage']->id)->first()->quantity)->toBe(16);

    $item1 = OrderItem::where('menu_modality_id', $data['modalityCompleto']->id)->first();
    $item2 = OrderItem::where('product_id', $data['pBeverage']->id)->first();

    // Cancelar ítem 1 (modalidad)
    $this->actingAs($user)
        ->post(route('order-items.cancel', $item1), ['cancellation_reason' => 'Cambio solicitado'])
        ->assertRedirect(route('orders.index'));

    expect($data['dmpSegundo']->fresh()->quantity_available)->toBe(10);

    // La bebida ya figura entregada, por lo que requiere aprobación.
    $this->actingAs($user)
        ->post(route('order-items.cancel', $item2), ['cancellation_reason' => 'Cambio solicitado'])
        ->assertRedirect(route('orders.index'));

    $this->actingAs($user)
        ->patch(route('cancellation-requests.review', CancellationRequest::firstOrFail()), [
            'decision' => 'approved',
        ]);

    expect(ProductStock::where('product_id', $data['pBeverage']->id)->first()->quantity)->toBe(20);
});
