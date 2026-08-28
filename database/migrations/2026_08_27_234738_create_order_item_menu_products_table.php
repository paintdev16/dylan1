<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_item_menu_products', function (Blueprint $table) {
            $table->id();

            $table->foreignId('order_item_id')
                ->constrained('order_items')
                ->cascadeOnDelete();

            $table->foreignId('daily_menu_product_id')
                ->constrained('daily_menu_products')
                ->restrictOnDelete();

            $table->unsignedInteger('quantity')
                ->default(1);

            $table->timestamps();

            $table->unique([
                'order_item_id',
                'daily_menu_product_id',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_item_menu_products');
    }
};
