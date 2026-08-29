<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check');
            DB::statement('ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_kitchen_status_check');
            DB::statement('ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_method_check');
            DB::statement('ALTER TABLE menu_modality_items DROP CONSTRAINT IF EXISTS menu_modality_items_item_type_check');
            DB::statement('ALTER TABLE products DROP CONSTRAINT IF EXISTS products_status_check');
            DB::statement('ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_type_check');
        }

        DB::table('orders')->update(['status' => DB::raw("CASE status WHEN 'pendiente' THEN 'pending' WHEN 'enviado_cocina' THEN 'sent_to_kitchen' WHEN 'completado' THEN 'completed' ELSE status END")]);
        DB::table('order_items')->update(['kitchen_status' => DB::raw("CASE kitchen_status WHEN 'pendiente' THEN 'pending' WHEN 'en_preparacion' THEN 'in_preparation' WHEN 'listo' THEN 'ready' WHEN 'entregado' THEN 'delivered' ELSE kitchen_status END")]);
        DB::table('payments')->update(['payment_method' => DB::raw("CASE payment_method WHEN 'efectivo' THEN 'cash' WHEN 'tarjeta' THEN 'card' ELSE payment_method END")]);
        DB::table('menu_modality_items')->update(['item_type' => DB::raw("CASE item_type WHEN 'segundo' THEN 'main_course' WHEN 'entrada' THEN 'starter' WHEN 'postre' THEN 'dessert' ELSE item_type END")]);
        DB::table('products')->update(['status' => DB::raw("CASE status WHEN 'activo' THEN 'active' WHEN 'inactivo' THEN 'inactive' ELSE status END")]);
        DB::table('stock_movements')->update(['type' => DB::raw("CASE type WHEN 'entrada' THEN 'stock_in' WHEN 'salida_venta' THEN 'sale' WHEN 'ajuste' THEN 'adjustment' WHEN 'cancelacion' THEN 'cancellation' ELSE type END")]);
        DB::table('payments')->update(['receipt_type' => DB::raw("CASE receipt_type WHEN 'boleta' THEN 'receipt' WHEN 'factura' THEN 'invoice' ELSE receipt_type END")]);

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'sent_to_kitchen', 'completed'))");
            DB::statement("ALTER TABLE order_items ADD CONSTRAINT order_items_kitchen_status_check CHECK (kitchen_status IN ('pending', 'in_preparation', 'ready', 'delivered'))");
            DB::statement("ALTER TABLE payments ADD CONSTRAINT payments_payment_method_check CHECK (payment_method IN ('cash', 'card', 'yape', 'plin'))");
            DB::statement("ALTER TABLE menu_modality_items ADD CONSTRAINT menu_modality_items_item_type_check CHECK (item_type IN ('main_course', 'starter', 'dessert'))");
            DB::statement("ALTER TABLE products ADD CONSTRAINT products_status_check CHECK (status IN ('active', 'inactive'))");
            DB::statement("ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_type_check CHECK (type IN ('stock_in', 'sale', 'adjustment', 'cancellation'))");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check');
            DB::statement('ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_kitchen_status_check');
            DB::statement('ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_method_check');
            DB::statement('ALTER TABLE menu_modality_items DROP CONSTRAINT IF EXISTS menu_modality_items_item_type_check');
            DB::statement('ALTER TABLE products DROP CONSTRAINT IF EXISTS products_status_check');
            DB::statement('ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_type_check');
        }

        DB::table('orders')->update(['status' => DB::raw("CASE status WHEN 'pending' THEN 'pendiente' WHEN 'sent_to_kitchen' THEN 'enviado_cocina' WHEN 'completed' THEN 'completado' ELSE status END")]);
        DB::table('order_items')->update(['kitchen_status' => DB::raw("CASE kitchen_status WHEN 'pending' THEN 'pendiente' WHEN 'in_preparation' THEN 'en_preparacion' WHEN 'ready' THEN 'listo' WHEN 'delivered' THEN 'entregado' ELSE kitchen_status END")]);
        DB::table('payments')->update(['payment_method' => DB::raw("CASE payment_method WHEN 'cash' THEN 'efectivo' WHEN 'card' THEN 'tarjeta' ELSE payment_method END")]);
        DB::table('menu_modality_items')->update(['item_type' => DB::raw("CASE item_type WHEN 'main_course' THEN 'segundo' WHEN 'starter' THEN 'entrada' WHEN 'dessert' THEN 'postre' ELSE item_type END")]);
        DB::table('products')->update(['status' => DB::raw("CASE status WHEN 'active' THEN 'activo' WHEN 'inactive' THEN 'inactivo' ELSE status END")]);
        DB::table('stock_movements')->update(['type' => DB::raw("CASE type WHEN 'stock_in' THEN 'entrada' WHEN 'sale' THEN 'salida_venta' WHEN 'adjustment' THEN 'ajuste' WHEN 'cancellation' THEN 'cancelacion' ELSE type END")]);
        DB::table('payments')->update(['receipt_type' => DB::raw("CASE receipt_type WHEN 'receipt' THEN 'boleta' WHEN 'invoice' THEN 'factura' ELSE receipt_type END")]);

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pendiente', 'enviado_cocina', 'completado'))");
            DB::statement("ALTER TABLE order_items ADD CONSTRAINT order_items_kitchen_status_check CHECK (kitchen_status IN ('pendiente', 'en_preparacion', 'listo', 'entregado'))");
            DB::statement("ALTER TABLE payments ADD CONSTRAINT payments_payment_method_check CHECK (payment_method IN ('efectivo', 'tarjeta', 'yape', 'plin'))");
            DB::statement("ALTER TABLE menu_modality_items ADD CONSTRAINT menu_modality_items_item_type_check CHECK (item_type IN ('segundo', 'entrada', 'postre'))");
            DB::statement("ALTER TABLE products ADD CONSTRAINT products_status_check CHECK (status IN ('activo', 'inactivo'))");
            DB::statement("ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_type_check CHECK (type IN ('entrada', 'salida_venta', 'ajuste', 'cancelacion'))");
        }
    }
};
