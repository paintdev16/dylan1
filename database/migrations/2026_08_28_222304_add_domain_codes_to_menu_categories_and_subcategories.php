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
        Schema::table('menu_categories', function (Blueprint $table) {
            $table->string('code')->nullable()->unique()->after('name');
        });

        Schema::table('menu_subcategories', function (Blueprint $table) {
            $table->string('code')->nullable()->after('name');
            $table->unique(['menu_category_id', 'code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('menu_subcategories', function (Blueprint $table) {
            $table->dropUnique(['menu_category_id', 'code']);
            $table->dropColumn('code');
        });

        Schema::table('menu_categories', function (Blueprint $table) {
            $table->dropUnique(['code']);
            $table->dropColumn('code');
        });
    }
};
