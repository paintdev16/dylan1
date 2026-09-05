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
        Schema::create('menu_modalities', function (Blueprint $table) {
            $table->id();

            $table->foreignId('daily_menu_id')
                ->constrained('daily_menus')
                ->cascadeOnDelete();

            $table->string('code')->nullable();

            $table->string('name');

            $table->text('description')->nullable();

            $table->decimal('price', 10, 2);

            $table->unsignedInteger('display_order')
                ->default(0);

            $table->boolean('active')
                ->default(true);

            $table->timestamps();

            $table->unique([
                'daily_menu_id',
                'name',
            ]);
            $table->unique(['daily_menu_id', 'code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_modalities');
    }
};
