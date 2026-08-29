<?php

use App\Models\Bill;
use App\Models\CancellationRequest;
use App\Models\MenuCategory;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\RestaurantTable;
use App\Models\StockMovement;
use App\Models\User;

function setupCancellationTestData(): array
{
    $category = MenuCategory::firstOrCreate(['name' => 'Bebidas'], ['display_order' => 2, 'active' => true]);
    $foodCategory = MenuCategory::firstOrCreate(['name' => 'Comidas'], ['display_order' => 1, 'active' => true]);

    $beverage = Product::create([
        'menu_category_id' => $category->id,
        'name' => 'Inca Kola 500ml',
        'price' => 4.00,
        'type' => 'simple',
        'status' => 'activo',
    ]);

    $stock = ProductStock::create([
        'product_id' => $beverage->id,
        'quantity' => 20,
    ]);

    $table = RestaurantTable::create([
        'number' => 30,
        'capacity' => 4,
        'status' => 'occupied',
    ]);

    $user = User::factory()->create(['name' => 'Mozo Pedro']);

    $bill = Bill::create([
        'table_id' => $table->id,
        'opening_waiter_id' => $user->id,
        'order_type' => 'dine_in',
        'status' => 'open',
        'opened_at' => now(),
    ]);

    $order = Order::create([
        'bill_id' => $bill->id,
        'user_id' => $user->id,
        'status' => 'pendiente',
    ]);

    return compact('user', 'beverage', 'stock', 'table', 'bill', 'order');
}

test('ordering beverage creates stock movement and cancelling it restores stock with cancellation movement and recalculates bill', function () {
    $data = setupCancellationTestData();

    // 1. Agregar bebida a la comanda (2 unidades)
    $this->actingAs($data['user'])
        ->post(route('orders.items.store', $data['order']), [
            'product_id' => $data['beverage']->id,
            'quantity' => 2,
        ]);

    // Verificar stock descontado: 20 - 2 = 18
    expect($data['stock']->fresh()->quantity)->toBe(18);

    // Verificar stock movement de salida
    $movementSale = StockMovement::where('type', 'salida_venta')->first();
    expect($movementSale)->not->toBeNull()
        ->and($movementSale->previous_quantity)->toBe(20)
        ->and($movementSale->quantity)->toBe(2)
        ->and($movementSale->new_quantity)->toBe(18);

    // Total de la cuenta: 2 x 4 = 8.00
    expect((float) $data['bill']->fresh()->total_amount)->toBe(8.00);

    // 2. Cancelar el ítem con motivo
    $item = OrderItem::where('product_id', $data['beverage']->id)->first();

    $this->actingAs($data['user'])
        ->post(route('order-items.cancel', $item), [
            'cancellation_reason' => 'Cliente cambió de opinión antes del despacho',
        ])
        ->assertRedirect(route('orders.index'));

    $cancellationRequest = CancellationRequest::firstOrFail();

    $this->actingAs($data['user'])
        ->patch(route('cancellation-requests.review', $cancellationRequest), [
            'decision' => 'approved',
        ])
        ->assertRedirect();

    $freshItem = $item->fresh();
    expect($freshItem->is_cancelled)->toBeTrue()
        ->and($freshItem->cancellation_reason)->toBe('Cliente cambió de opinión antes del despacho')
        ->and($freshItem->cancelled_by)->toBe($data['user']->id);

    // Verificar stock restaurado: 18 + 2 = 20
    expect($data['stock']->fresh()->quantity)->toBe(20);

    // Verificar stock movement de cancelación
    $movementCancel = StockMovement::where('type', 'cancelacion')->first();
    expect($movementCancel)->not->toBeNull()
        ->and($movementCancel->previous_quantity)->toBe(18)
        ->and($movementCancel->quantity)->toBe(2)
        ->and($movementCancel->new_quantity)->toBe(20);

    // Verificar recálculo de la cuenta: vuelve a 0.00
    expect((float) $data['bill']->fresh()->total_amount)->toBe(0.00);
});

test('cannot cancel item on closed or paid bills', function () {
    $data = setupCancellationTestData();

    $item = OrderItem::create([
        'order_id' => $data['order']->id,
        'product_id' => $data['beverage']->id,
        'quantity' => 1,
        'unit_price' => 4.00,
        'subtotal' => 4.00,
    ]);

    // Cerrar cuenta
    $data['bill']->update(['status' => 'closed', 'closed_at' => now()]);

    $this->actingAs($data['user'])
        ->post(route('order-items.cancel', $item), [
            'cancellation_reason' => 'Intento de anulación en cuenta cerrada',
        ])
        ->assertSessionHasErrors('item');

    expect($item->fresh()->is_cancelled)->toBeFalse();
});
