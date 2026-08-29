<?php

use App\Models\RestaurantTable;
use Database\Seeders\RestaurantTableSeeder;

test('seeded tables without live service start available', function () {
    $this->seed(RestaurantTableSeeder::class);

    expect(
        RestaurantTable::query()
            ->whereIn('number', [4, 6, 8])
            ->pluck('status', 'number')
            ->all()
    )->toBe([
        4 => 'available',
        6 => 'available',
        8 => 'available',
    ]);
});
