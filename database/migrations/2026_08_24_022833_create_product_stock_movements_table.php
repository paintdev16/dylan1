<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_stock_movements', function (Blueprint $table) {
            $table->id();

            $table->foreignId('product_stock_id')
                ->constrained('product_stocks')
                ->cascadeOnDelete();

            $table->enum('type', [
                'stock_in',
                'stock_out',
                'adjustment',
            ]);

            $table->unsignedInteger('quantity');

            $table->unsignedInteger('quantity_before');

            $table->unsignedInteger('quantity_after');

            $table->text('description')->nullable();

            $table->timestamps();

            $table->index(['product_stock_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_stock_movements');
    }
};
