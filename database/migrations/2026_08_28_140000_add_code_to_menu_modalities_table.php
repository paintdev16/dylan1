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
        Schema::table('menu_modalities', function (Blueprint $table) {
            $table->string('code')->nullable()->after('daily_menu_id');
        });

        DB::table('menu_modalities')->orderBy('id')->get()->each(function (object $modality): void {
            $name = mb_strtolower((string) $modality->name);
            $code = str_contains($name, 'completo')
                ? 'full_menu'
                : (str_contains($name, 'segundo') ? 'main_only' : 'starter_dessert');

            DB::table('menu_modalities')->where('id', $modality->id)->update(['code' => $code]);
        });

        Schema::table('menu_modalities', function (Blueprint $table) {
            $table->unique(['daily_menu_id', 'code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('menu_modalities', function (Blueprint $table) {
            $table->dropUnique(['daily_menu_id', 'code']);
            $table->dropColumn('code');
        });
    }
};
