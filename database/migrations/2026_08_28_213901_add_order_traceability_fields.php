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
        if (! Schema::hasColumn('orders', 'request_token')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->uuid('request_token')->nullable()->unique()->after('user_id');
            });
        }

        if (! Schema::hasColumn('order_items', 'daily_menu_product_id')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->foreignId('daily_menu_product_id')
                    ->nullable()
                    ->after('menu_modality_id')
                    ->constrained('daily_menu_products')
                    ->restrictOnDelete();
            });
        }

        if (! Schema::hasColumn('menu_subcategory_types', 'code')) {
            Schema::table('menu_subcategory_types', function (Blueprint $table) {
                $table->string('code')->nullable()->after('name');
            });
        }

        if (! Schema::hasColumn('stock_movements', 'quantity_change')) {
            Schema::table('stock_movements', function (Blueprint $table) {
                $table->integer('quantity_change')->nullable()->after('quantity');
            });
        }

        DB::table('stock_movements')->update([
            'quantity_change' => DB::raw('new_quantity - previous_quantity'),
        ]);

        DB::table('menu_subcategory_types')
            ->where('name', 'Segundos')
            ->update(['code' => 'main_course']);
        DB::table('menu_subcategory_types')
            ->where('name', 'Entradas')
            ->update(['code' => 'starter']);
        DB::table('menu_subcategory_types')
            ->where('name', 'Postres')
            ->update(['code' => 'dessert']);

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('menu_subcategory_types', function (Blueprint $table) {
            $table->dropUnique(['menu_subcategory_id', 'code']);
            $table->dropColumn('code');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('daily_menu_product_id');
        });

        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropColumn('quantity_change');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['request_token']);
            $table->dropColumn('request_token');
        });
    }
};
