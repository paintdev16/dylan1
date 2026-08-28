<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('menu_modality_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('menu_modality_id')
                ->constrained('menu_modalities')
                ->cascadeOnDelete();

            $table->foreignId('daily_menu_product_id')
                ->constrained('daily_menu_products')
                ->cascadeOnDelete();

            $table->enum('item_type', [
                'segundo',
                'entrada',
                'postre',
            ]);

            $table->unsignedInteger('quantity')
                ->default(1);

            $table->timestamps();

            $table->unique([
                'menu_modality_id',
                'daily_menu_product_id',
                'item_type',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_modality_items');
    }
};
