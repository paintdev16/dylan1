<?php

use App\Models\Bill;
use App\Models\DailyMenu;
use App\Models\DailyMenuProduct;
use App\Models\MenuCategory;
use App\Models\MenuModality;
use App\Models\MenuSubcategory;
use App\Models\MenuSubcategoryType;
use App\Models\Order;
use App\Models\OrderItemMenuProduct;
use App\Models\Payment;
use App\Models\Product;
use App\Models\RestaurantTable;
use App\Models\User;
use Database\Seeders\RolesPermissionsSeeder;
use Inertia\Testing\AssertableInertia as Assert;

test('reports include economic menu modalities in top sales', function () {
    $this->seed(RolesPermissionsSeeder::class);

    $administrator = User::factory()->create();
    $administrator->assignRole('admin');

    $dailyMenu = DailyMenu::create([
        'date' => now('America/Lima')->toDateString(),
        'active' => true,
    ]);
    $modality = MenuModality::create([
        'daily_menu_id' => $dailyMenu->id,
        'code' => 'full_menu',
        'name' => 'Menú completo',
        'price' => 14,
        'display_order' => 1,
        'active' => true,
    ]);
    $category = MenuCategory::create([
        'code' => 'food',
        'name' => 'Comidas',
        'display_order' => 1,
        'active' => true,
    ]);
    $subcategory = MenuSubcategory::create([
        'menu_category_id' => $category->id,
        'code' => 'economic_menu',
        'name' => 'Menú Económico',
        'display_order' => 1,
        'active' => true,
    ]);
    $mainCourseType = MenuSubcategoryType::create([
        'menu_subcategory_id' => $subcategory->id,
        'code' => 'main_course',
        'name' => 'Segundos',
        'display_order' => 1,
        'active' => true,
    ]);
    $mainCourse = Product::create([
        'menu_category_id' => $category->id,
        'menu_subcategory_id' => $subcategory->id,
        'menu_subcategory_type_id' => $mainCourseType->id,
        'name' => 'Seco de Pollo',
        'price' => 14,
        'type' => 'prepared',
        'status' => 'active',
    ]);
    $dailyMenuProduct = DailyMenuProduct::create([
        'daily_menu_id' => $dailyMenu->id,
        'product_id' => $mainCourse->id,
        'price' => 14,
        'quantity_available' => 10,
        'display_order' => 1,
        'active' => true,
    ]);
    $bill = Bill::create([
        'opening_waiter_id' => $administrator->id,
        'order_type' => 'takeout',
        'status' => 'open',
        'opened_at' => now(),
    ]);
    $order = Order::create([
        'bill_id' => $bill->id,
        'user_id' => $administrator->id,
    ]);

    $orderItem = $order->items()->create([
        'menu_modality_id' => $modality->id,
        'quantity' => 2,
        'unit_price' => 14,
        'subtotal' => 28,
        'kitchen_status' => 'delivered',
    ]);
    OrderItemMenuProduct::create([
        'order_item_id' => $orderItem->id,
        'daily_menu_product_id' => $dailyMenuProduct->id,
        'quantity' => 2,
    ]);

    $this->actingAs($administrator)
        ->get(route('reports.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports/index')
            ->where('filters.from', now('America/Lima')->toDateString())
            ->where('filters.to', now('America/Lima')->toDateString())
            ->where('topProducts.0.type', 'economic_menu')
            ->where('topProducts.0.name', 'Seco de Pollo')
            ->where('topProducts.0.quantity_sold', 2)
            ->where('topProducts.0.sales_total', 28));
});

test('reports list every payment with its bill table receipt and cashier details', function () {
    $this->seed(RolesPermissionsSeeder::class);

    $administrator = User::factory()->create(['name' => 'Cajero Principal']);
    $administrator->assignRole('admin');

    $table = RestaurantTable::create([
        'number' => 7,
        'capacity' => 4,
        'status' => 'available',
    ]);

    $bill = Bill::create([
        'table_id' => $table->id,
        'opening_waiter_id' => $administrator->id,
        'order_type' => 'dine_in',
        'status' => 'closed',
        'opened_at' => now(),
        'closed_at' => now(),
    ]);

    $payment = Payment::create([
        'bill_id' => $bill->id,
        'cashier_id' => $administrator->id,
        'payment_method' => 'yape',
        'amount' => 42.50,
        'operation_code' => 'YAPE-12345',
        'receipt_type' => 'receipt',
        'receipt_number' => 'B001-00042',
        'customer_name' => 'Cliente Prueba',
        'customer_document' => '12345678',
    ]);

    $this->actingAs($administrator)
        ->get(route('reports.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports/index')
            ->has('payments', 1)
            ->where('payments.0.id', $payment->id)
            ->where('payments.0.bill_id', $bill->id)
            ->where('payments.0.table_number', 7)
            ->where('payments.0.cashier_name', 'Cajero Principal')
            ->where('payments.0.payment_method', 'yape')
            ->where('payments.0.amount', 42.5)
            ->where('payments.0.receipt_type', 'receipt')
            ->where('payments.0.receipt_number', 'B001-00042')
            ->where('payments.0.operation_code', 'YAPE-12345')
            ->where('payments.0.customer_document', '12345678'));
});
