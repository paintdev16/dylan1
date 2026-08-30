<?php

namespace Database\Seeders;

use App\Models\RestaurantTable;
use Illuminate\Database\Seeder;

class RestaurantTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tables = [
            ['number' => 1, 'capacity' => 2, 'status' => 'available'],
            ['number' => 2, 'capacity' => 2, 'status' => 'available'],
            ['number' => 3, 'capacity' => 4, 'status' => 'available'],
            ['number' => 4, 'capacity' => 4, 'status' => 'available'],
            ['number' => 5, 'capacity' => 4, 'status' => 'available'],
            ['number' => 6, 'capacity' => 6, 'status' => 'available'],
            ['number' => 7, 'capacity' => 6, 'status' => 'out_of_service'],
            ['number' => 8, 'capacity' => 8, 'status' => 'available'],
            ['number' => 9, 'capacity' => 4, 'status' => 'available'],
            ['number' => 10, 'capacity' => 8, 'status' => 'out_of_service'],
        ];

        foreach ($tables as $table) {
            RestaurantTable::updateOrCreate(
                ['number' => $table['number']],
                ['capacity' => $table['capacity'], 'status' => $table['status']]
            );
        }
    }
}
