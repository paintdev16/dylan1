<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('menu_categories')->where('name', 'Comidas')->update(['code' => 'food']);
        DB::table('menu_categories')->where('name', 'Bebidas')->update(['code' => 'beverages']);
        DB::table('menu_subcategories')->where('name', 'Menú Económico')->update(['code' => 'economic_menu']);
        DB::table('menu_subcategories')->where('name', 'Platos Especiales')->update(['code' => 'special_dishes']);
        DB::table('menu_subcategory_types')->where('name', 'Segundos')->update(['code' => 'main_course']);
        DB::table('menu_subcategory_types')->where('name', 'Entradas')->update(['code' => 'starter']);
        DB::table('menu_subcategory_types')->where('name', 'Postres')->update(['code' => 'dessert']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('menu_categories')->update(['code' => null]);
        DB::table('menu_subcategories')->update(['code' => null]);
    }
};
