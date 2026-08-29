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
        Schema::create('products', function (Blueprint $table) {
            $table->id();

            $table->foreignId('menu_category_id')
                ->constrained('menu_categories')
                ->restrictOnDelete();

            $table->foreignId('menu_subcategory_id')
                ->nullable()
                ->constrained('menu_subcategories')
                ->nullOnDelete();

            $table->foreignId('menu_subcategory_type_id')
                ->nullable()
                ->constrained('menu_subcategory_types')
                ->nullOnDelete();

            $table->string('name');

            $table->text('description')->nullable();

            $table->string('presentation')->nullable();

            $table->decimal('price', 10, 2);

            $table->string('image')->nullable();

            $table->enum('type', [
                'simple',
                'prepared',
            ]);

            $table->enum('status', [
                'active',
                'inactive',
            ]);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
