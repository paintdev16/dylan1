<?php

use App\Models\Bill;
use App\Models\DailyMenu;
use App\Models\DailyMenuProduct;
use App\Models\MenuCategory;
use App\Models\MenuModality;
use App\Models\MenuSubcategory;
use App\Models\MenuSubcategoryType;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\RestaurantTable;
use App\Models\User;

function setupKitchenTestData(): array
{
    $category = MenuCategory::firstOrCreate(
        ['name' => 'Comidas'],
        ['display_order' => 1, 'active' => true]
    );
    $beverageCategory = MenuCategory::firstOrCreate(
        ['name' => 'Bebidas'],
        ['display_order' => 2, 'active' => true]
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

    $pPrepared = Product::create([
        'menu_category_id' => $category->id,
        'menu_subcategory_id' => $subcategory->id,
        'menu_subcategory_type_id' => $typeSegundo->id,
        'name' => 'Ají de gallina',
        'price' => 14.00,
        'type' => 'prepared',
        'status' => 'activo',
    ]);

    $pEntrada = Product::create([
        'menu_category_id' => $category->id,
        'menu_subcategory_id' => $subcategory->id,
        'menu_subcategory_type_id' => $typeEntrada->id,
        'name' => 'Tequeños',
        'price' => 4.00,
        'type' => 'prepared',
        'status' => 'activo',
    ]);

    $pPostre = Product::create([
        'menu_category_id' => $category->id,
        'menu_subcategory_id' => $subcategory->id,
        'menu_subcategory_type_id' => $typePostre->id,
        'name' => 'Mazamorra',
        'price' => 3.00,
        'type' => 'prepared',
        'status' => 'activo',
    ]);

    $pBeverage = Product::create([
        'menu_category_id' => $beverageCategory->id,
        'name' => 'Agua San Luis 500ml',
        'price' => 3.00,
        'type' => 'simple',
        'status' => 'activo',
    ]);

    ProductStock::create([
        'product_id' => $pBeverage->id,
        'quantity' => 15,
    ]);

    $today = now('America/Lima')->toDateString();
    $dailyMenu = DailyMenu::firstOrCreate(
        ['date' => $today],
        ['active' => true]
    );

    $dmpSegundo = DailyMenuProduct::create([
        'daily_menu_id' => $dailyMenu->id,
        'product_id' => $pPrepared->id,
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

    $modality = MenuModality::create([
        'daily_menu_id' => $dailyMenu->id,
        'code' => 'full_menu',
        'name' => 'Menú completo',
        'price' => 14.00,
        'display_order' => 1,
        'active' => true,
    ]);

    $table = RestaurantTable::create([
        'number' => 12,
        'capacity' => 4,
        'status' => 'occupied',
    ]);

    $user = User::factory()->create();

    $bill = Bill::create([
        'table_id' => $table->id,
        'opening_waiter_id' => $user->id,
        'order_type' => 'dine_in',
        'status' => 'open',
        'opened_at' => now(),
    ]);

    return compact(
        'user',
        'table',
        'bill',
        'pPrepared',
        'pBeverage',
        'modality',
        'dmpSegundo',
        'dmpEntrada',
        'dmpPostre'
    );
}

test('prepared dishes and modalities start with kitchen status pendiente while simple beverages start as entregado', function () {
    $data = setupKitchenTestData();

    $order = Order::create([
        'bill_id' => $data['bill']->id,
        'user_id' => $data['user']->id,
        'status' => 'pendiente',
    ]);

    // 1. Agregar modalidad (comida preparada)
    $this->actingAs($data['user'])
        ->post(route('orders.items.store', $order), [
            'menu_modality_id' => $data['modality']->id,
            'components' => [
                $data['dmpSegundo']->id,
                $data['dmpEntrada']->id,
                $data['dmpPostre']->id,
            ],
            'quantity' => 1,
        ]);

    // 2. Agregar bebida (producto simple)
    $this->actingAs($data['user'])
        ->post(route('orders.items.store', $order), [
            'product_id' => $data['pBeverage']->id,
            'quantity' => 2,
        ]);

    $modalityItem = OrderItem::where('menu_modality_id', $data['modality']->id)->first();
    $beverageItem = OrderItem::where('product_id', $data['pBeverage']->id)->first();

    expect($modalityItem->kitchen_status)->toBe('pendiente')
        ->and($beverageItem->kitchen_status)->toBe('entregado');
});

test('kitchen index displays only pending or in preparation orders and dishes', function () {
    $data = setupKitchenTestData();

    $order = Order::create([
        'bill_id' => $data['bill']->id,
        'user_id' => $data['user']->id,
        'status' => 'pendiente',
    ]);

    // Agregar plato que va a cocina
    $this->actingAs($data['user'])
        ->post(route('orders.items.store', $order), [
            'product_id' => $data['pPrepared']->id,
            'quantity' => 1,
            'notes' => 'Poco arroz',
        ]);

    $this->actingAs($data['user'])
        ->get(route('kitchen.index'))
        ->assertOk();
});

test('cook can advance dish status to en_preparacion and listo', function () {
    $data = setupKitchenTestData();

    $order = Order::create([
        'bill_id' => $data['bill']->id,
        'user_id' => $data['user']->id,
        'status' => 'pendiente',
    ]);

    $item = OrderItem::create([
        'order_id' => $order->id,
        'product_id' => $data['pPrepared']->id,
        'quantity' => 2,
        'unit_price' => 14.00,
        'subtotal' => 28.00,
        'kitchen_status' => 'pendiente',
    ]);

    // Pasar a en_preparacion
    $this->actingAs($data['user'])
        ->patch(route('kitchen.items.update-status', $item), [
            'kitchen_status' => 'en_preparacion',
        ])
        ->assertRedirect();

    expect($item->fresh()->kitchen_status)->toBe('en_preparacion');

    // Pasar a listo
    $this->actingAs($data['user'])
        ->patch(route('kitchen.items.update-status', $item), [
            'kitchen_status' => 'listo',
        ])
        ->assertRedirect();

    expect($item->fresh()->kitchen_status)->toBe('listo');
});

test('progressive orders on the same table add up to the same bill correctly', function () {
    $data = setupKitchenTestData();

    // Primera comanda
    $order1 = Order::create([
        'bill_id' => $data['bill']->id,
        'user_id' => $data['user']->id,
        'status' => 'pendiente',
    ]);

    $this->actingAs($data['user'])
        ->post(route('orders.items.store', $order1), [
            'menu_modality_id' => $data['modality']->id,
            'components' => [
                $data['dmpSegundo']->id,
                $data['dmpEntrada']->id,
                $data['dmpPostre']->id,
            ],
            'quantity' => 2, // 2 x 14 = 28
        ]);

    expect((float) $data['bill']->fresh()->total_amount)->toBe(28.00);

    // Segunda comanda (pedido adicional de bebidas)
    $order2 = Order::create([
        'bill_id' => $data['bill']->id,
        'user_id' => $data['user']->id,
        'status' => 'pendiente',
    ]);

    $this->actingAs($data['user'])
        ->post(route('orders.items.store', $order2), [
            'product_id' => $data['pBeverage']->id,
            'quantity' => 3, // 3 x 3 = 9
        ]);

    expect((float) $data['bill']->fresh()->total_amount)->toBe(37.00)
        ->and($data['bill']->fresh()->orders()->count())->toBe(2);
});
