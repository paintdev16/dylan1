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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bill_id')
                ->index()
                ->constrained('bills')
                ->cascadeOnDelete();
            $table->foreignId('user_id')
                ->index()
                ->constrained('users')
                ->restrictOnDelete();
            $table->uuid('request_token')->nullable()->unique();
            $table->enum('status', ['pending', 'sent_to_kitchen', 'completed'])
                ->default('sent_to_kitchen')
                ->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
