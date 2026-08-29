<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('product_stock_movements')
            ->join('product_stocks', 'product_stocks.id', '=', 'product_stock_movements.product_stock_id')
            ->orderBy('product_stock_movements.id')
            ->select(['product_stock_movements.*', 'product_stocks.product_id'])
            ->get()
            ->each(function (object $movement): void {
                DB::table('stock_movements')->insert([
                    'product_id' => $movement->product_id,
                    'user_id' => null,
                    'type' => $movement->type === 'salida' ? 'salida_venta' : $movement->type,
                    'quantity' => $movement->quantity,
                    'quantity_change' => $movement->quantity_after - $movement->quantity_before,
                    'previous_quantity' => $movement->quantity_before,
                    'new_quantity' => $movement->quantity_after,
                    'description' => $movement->description,
                    'created_at' => $movement->created_at,
                    'updated_at' => $movement->updated_at,
                ]);
            });

        Schema::dropIfExists('product_stock_movements');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('product_stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_stock_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['entrada', 'salida', 'ajuste']);
            $table->unsignedInteger('quantity');
            $table->unsignedInteger('quantity_before');
            $table->unsignedInteger('quantity_after');
            $table->string('description')->nullable();
            $table->timestamps();
        });
    }
};
