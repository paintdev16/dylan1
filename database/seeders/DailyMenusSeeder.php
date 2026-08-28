<?php

namespace Database\Seeders;

use App\Models\DailyMenu;
use Illuminate\Database\Seeder;

class DailyMenusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Menú de hoy (zona horaria de Perú)
        DailyMenu::updateOrCreate(
            [
                'date' => now('America/Lima')->toDateString(),
            ],
            [
                'active' => true,
            ]
        );

        // Menú histórico de ayer como ejemplo
        DailyMenu::updateOrCreate(
            [
                'date' => now('America/Lima')->subDay()->toDateString(),
            ],
            [
                'active' => false,
            ]
        );
    }
}
