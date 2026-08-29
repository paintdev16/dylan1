<?php

use App\Models\Bill;
use App\Models\CancellationRequest;
use App\Models\CashRegisterSession;
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
use App\Models\StockMovement;
use App\Models\TableSession;
use App\Models\User;

test('full end-to-end restaurant lifecycle: menu setup -> table opening -> progressive ordering -> kitchen kds -> stock deduction & cancellation -> cashier shift & payment -> atomic table release & shift close', function () {
    // 1. Configuración de Catálogo y Menú Diario de Hoy (Perú)
    $categoryFood = MenuCategory::firstOrCreate(['name' => 'Comidas'], ['display_order' => 1, 'active' => true]);
    $categoryBeverage = MenuCategory::firstOrCreate(['name' => 'Bebidas'], ['display_order' => 2, 'active' => true]);

    $subEco = MenuSubcategory::firstOrCreate(['name' => 'Menú Económico', 'menu_category_id' => $categoryFood->id], ['display_order' => 1, 'active' => true]);
    $typeSegundo = MenuSubcategoryType::firstOrCreate(['name' => 'Segundos', 'menu_subcategory_id' => $subEco->id], ['code' => 'main_course', 'display_order' => 1, 'active' => true]);
    $typeEntrada = MenuSubcategoryType::firstOrCreate(['name' => 'Entradas', 'menu_subcategory_id' => $subEco->id], ['code' => 'starter', 'display_order' => 2, 'active' => true]);
    $typePostre = MenuSubcategoryType::firstOrCreate(['name' => 'Postres', 'menu_subcategory_id' => $subEco->id], ['code' => 'dessert', 'display_order' => 3, 'active' => true]);

    $pSeco = Product::create([
        'menu_category_id' => $categoryFood->id,
        'menu_subcategory_id' => $subEco->id,
        'menu_subcategory_type_id' => $typeSegundo->id,
        'name' => 'Seco de res con frijoles',
        'price' => 15.00,
        'type' => 'prepared',
        'status' => 'active',
    ]);

    $pPapa = Product::create([
        'menu_category_id' => $categoryFood->id,
        'menu_subcategory_id' => $subEco->id,
        'menu_subcategory_type_id' => $typeEntrada->id,
        'name' => 'Papa a la huancaína',
        'price' => 4.00,
        'type' => 'prepared',
        'status' => 'active',
    ]);

    $pGelatina = Product::create([
        'menu_category_id' => $categoryFood->id,
        'menu_subcategory_id' => $subEco->id,
        'menu_subcategory_type_id' => $typePostre->id,
        'name' => 'Gelatina de fresa',
        'price' => 3.00,
        'type' => 'prepared',
        'status' => 'active',
    ]);

    $pGaseosa = Product::create([
        'menu_category_id' => $categoryBeverage->id,
        'name' => 'Inca Kola 500ml',
        'price' => 4.50,
        'type' => 'simple',
        'status' => 'active',
    ]);

    $stockBebida = ProductStock::create([
        'product_id' => $pGaseosa->id,
        'quantity' => 25,
    ]);

    $todayDate = now('America/Lima')->toDateString();
    $dailyMenu = DailyMenu::firstOrCreate(
        ['date' => $todayDate],
        ['active' => true]
    );

    $dmpSegundo = DailyMenuProduct::create([
        'daily_menu_id' => $dailyMenu->id,
        'product_id' => $pSeco->id,
        'price' => 15.00,
        'quantity_available' => 12,
        'display_order' => 1,
        'active' => true,
    ]);

    $dmpEntrada = DailyMenuProduct::create([
        'daily_menu_id' => $dailyMenu->id,
        'product_id' => $pPapa->id,
        'price' => 4.00,
        'quantity_available' => 12,
        'display_order' => 2,
        'active' => true,
    ]);

    $dmpPostre = DailyMenuProduct::create([
        'daily_menu_id' => $dailyMenu->id,
        'product_id' => $pGelatina->id,
        'price' => 3.00,
        'quantity_available' => 12,
        'display_order' => 3,
        'active' => true,
    ]);

    $modalityCompleto = MenuModality::create([
        'daily_menu_id' => $dailyMenu->id,
        'code' => 'full_menu',
        'name' => 'Menú completo',
        'price' => 15.00,
        'display_order' => 1,
        'active' => true,
    ]);
    MenuModalityItem::create(['menu_modality_id' => $modalityCompleto->id, 'daily_menu_product_id' => $dmpSegundo->id, 'item_type' => 'main_course']);
    MenuModalityItem::create(['menu_modality_id' => $modalityCompleto->id, 'daily_menu_product_id' => $dmpEntrada->id, 'item_type' => 'starter']);
    MenuModalityItem::create(['menu_modality_id' => $modalityCompleto->id, 'daily_menu_product_id' => $dmpPostre->id, 'item_type' => 'dessert']);

    // 2. Personal: Mozo, Cocinero, Cajero
    $mozo = User::factory()->create(['name' => 'Mozo Roberto']);
    $cocinero = User::factory()->create(['name' => 'Chef Juan']);
    $cajero = User::factory()->create(['name' => 'Cajera Lucía']);

    // 3. Apertura de Mesa y primera comanda por el Mozo
    $table = RestaurantTable::create([
        'number' => 8,
        'capacity' => 4,
        'status' => 'available',
    ]);

    $this->actingAs($mozo)
        ->post(route('orders.tables.store', $table), [
            'customer_count' => 2,
            'menu_modality_id' => $modalityCompleto->id,
            'components' => [$dmpSegundo->id, $dmpEntrada->id, $dmpPostre->id],
            'quantity' => 2,
            'notes' => 'Sin cebolla en la huancaína',
        ])
        ->assertRedirect(route('orders.index'));

    expect($table->fresh()->status)->toBe('occupied');

    $session = TableSession::where('restaurant_table_id', $table->id)->first();
    expect($session)->not->toBeNull()
        ->and($session->status)->toBe('open')
        ->and($session->customer_count)->toBe(2);

    $bill = Bill::where('table_id', $table->id)->first();
    expect($bill)->not->toBeNull()
        ->and($bill->status)->toBe('open')
        ->and((float) $bill->total_amount)->toBe(30.00);

    // Verificar deducción de porciones: 12 - 2 = 10
    expect($dmpSegundo->fresh()->quantity_available)->toBe(10)
        ->and($dmpEntrada->fresh()->quantity_available)->toBe(10)
        ->and($dmpPostre->fresh()->quantity_available)->toBe(10);

    // Total de la cuenta: 2 x 15 = S/. 30.00
    expect((float) $bill->fresh()->total_amount)->toBe(30.00);

    // 5. Envío inteligente a Cocina: Comida preparada en 'pending'
    $order1 = Order::where('bill_id', $bill->id)->first();
    $foodItem = $order1->items()->first();
    expect($foodItem->kitchen_status)->toBe('pending');

    // 6. Cocina KDS: Cocinero empieza preparación y la termina
    $this->actingAs($cocinero)
        ->patch(route('kitchen.items.update-status', $foodItem), [
            'kitchen_status' => 'in_preparation',
        ]);
    expect($foodItem->fresh()->kitchen_status)->toBe('in_preparation');

    $this->actingAs($cocinero)
        ->patch(route('kitchen.items.update-status', $foodItem), [
            'kitchen_status' => 'ready',
        ]);
    expect($foodItem->fresh()->kitchen_status)->toBe('ready');

    // 7. Pedido Progresivo Adicional: 2 Inca Kolas a la misma cuenta
    $order2 = Order::create([
        'bill_id' => $bill->id,
        'user_id' => $mozo->id,
        'status' => 'pending',
    ]);

    $this->actingAs($mozo)
        ->post(route('orders.items.store', $order2), [
            'product_id' => $pGaseosa->id,
            'quantity' => 2,
        ]);

    // Bebidas no saturan cocina (inician entregadas) y descuentan stock físico: 25 - 2 = 23
    $beverageItem = OrderItem::where('product_id', $pGaseosa->id)->first();
    expect($beverageItem->kitchen_status)->toBe('delivered')
        ->and($stockBebida->fresh()->quantity)->toBe(23);

    // Registro en StockMovement de tipo salida_venta
    $movementSale = StockMovement::where('product_id', $pGaseosa->id)->where('type', 'sale')->first();
    expect($movementSale)->not->toBeNull()
        ->and($movementSale->previous_quantity)->toBe(25)
        ->and($movementSale->new_quantity)->toBe(23);

    // Total acumulado de la cuenta: 30 + (2 x 4.50) = S/. 39.00
    expect((float) $bill->fresh()->total_amount)->toBe(39.00);

    // 8. Cancelación con Auditoría: Cliente devuelve 1 gaseosa
    $this->actingAs($mozo)
        ->post(route('order-items.cancel', $beverageItem), [
            'cancellation_reason' => 'Cliente canceló las gaseosas antes de destaparlas',
        ]);

    $this->actingAs($cajero)
        ->patch(route('cancellation-requests.review', CancellationRequest::firstOrFail()), [
            'decision' => 'approved',
        ]);

    // Stock restaurado: 23 + 2 = 25
    expect($stockBebida->fresh()->quantity)->toBe(25);

    // Total de la cuenta recalculado: vuelve a S/. 30.00
    expect((float) $bill->fresh()->total_amount)->toBe(30.00);

    // 9. Apertura de Turno de Caja por la Cajera
    $this->actingAs($cajero)
        ->post(route('cash-register.open'), [
            'opening_amount' => 100.00,
        ]);

    $cashRegister = CashRegisterSession::where('user_id', $cajero->id)->where('status', 'open')->first();
    expect($cashRegister)->not->toBeNull();

    // 10. Cobro de la cuenta en Caja con Efectivo (S/. 50 recibido para cuenta de S/. 30)
    $this->actingAs($cajero)
        ->post(route('cash-register.pay', $bill), [
            'payment_method' => 'cash',
            'amount' => 30.00,
            'received_amount' => 50.00,
        ])
        ->assertRedirect(route('cash-register.index'));

    // 11. Verificación del Cierre Post-Pago Atómico
    expect($bill->fresh()->status)->toBe('closed')
        ->and($bill->fresh()->closed_at)->not->toBeNull()
        ->and((float) $bill->fresh()->balance)->toBe(0.00)
        ->and($session->fresh()->status)->toBe('closed')
        ->and($session->fresh()->closed_at)->not->toBeNull()
        ->and($table->fresh()->status)->toBe('available')
        ->and($order1->fresh()->status)->toBe('completed');

    // 12. Cierre y Arqueo de Caja (Efectivo esperado = 100 fondo + 30 cobro = S/. 130.00)
    $this->actingAs($cajero)
        ->post(route('cash-register.close', $cashRegister), [
            'closing_amount' => 130.00,
            'notes' => 'Turno sin novedades, cuadre exacto',
        ]);

    expect($cashRegister->fresh()->status)->toBe('closed')
        ->and((float) $cashRegister->fresh()->expected_amount)->toBe(130.00)
        ->and((float) $cashRegister->fresh()->closing_amount)->toBe(130.00)
        ->and((float) $cashRegister->fresh()->difference)->toBe(0.00);
});
