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
        Schema::create('menu_subcategory_types', function (Blueprint $table) {
            $table->id();

            $table->foreignId('menu_subcategory_id')
                ->constrained('menu_subcategories')
                ->cascadeOnDelete();

            $table->string('name');
            $table->string('code')->nullable();

            $table->unsignedInteger('display_order')
                ->default(0);

            $table->boolean('active')
                ->default(true);

            $table->timestamps();

            $table->unique([
                'menu_subcategory_id',
                'name',
            ]);
            $table->unique(['menu_subcategory_id', 'code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_subcategory_types');
    }
};
