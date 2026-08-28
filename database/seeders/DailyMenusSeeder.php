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
        for ($i = 0; $i < 5; $i++) {
            DailyMenu::updateOrCreate(
                [
                    'date' => today()->addDays($i)->toDateString(),
                ],
                [
                    'active' => true,
                ]
            );
        }
    }
}
