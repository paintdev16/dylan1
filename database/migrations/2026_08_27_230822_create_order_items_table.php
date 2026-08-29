<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('order_id')
                ->constrained('orders')
                ->cascadeOnDelete();

            $table->foreignId('product_id')
                ->nullable()
                ->constrained('products')
                ->restrictOnDelete();

            $table->foreignId('menu_modality_id')
                ->nullable()
                ->constrained('menu_modalities')
                ->restrictOnDelete();

            $table->foreignId('daily_menu_product_id')
                ->nullable()
                ->constrained('daily_menu_products')
                ->restrictOnDelete();

            $table->unsignedInteger('quantity');

            $table->text('notes')->nullable();

            $table->decimal('unit_price', 10, 2);

            $table->decimal('subtotal', 10, 2);

            $table->enum('kitchen_status', [
                'pendiente',
                'en_preparacion',
                'listo',
                'entregado',
            ])->default('pendiente');

            $table->timestamps();
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('
                ALTER TABLE order_items
                ADD CONSTRAINT chk_order_items_origin
                CHECK (
                    (product_id IS NOT NULL AND menu_modality_id IS NULL)
                    OR
                    (product_id IS NULL AND menu_modality_id IS NOT NULL)
                )
            ');

            DB::statement('
                ALTER TABLE order_items
                ADD CONSTRAINT chk_order_items_quantity
                CHECK (quantity > 0)
            ');

            DB::statement('
                ALTER TABLE order_items
                ADD CONSTRAINT chk_order_items_unit_price
                CHECK (unit_price >= 0)
            ');

            DB::statement('
                ALTER TABLE order_items
                ADD CONSTRAINT chk_order_items_subtotal
                CHECK (subtotal >= 0)
            ');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
