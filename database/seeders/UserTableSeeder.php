<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $superAdmin = User::firstOrCreate(
            ['email' => 'paint@gmail.com'],
            [
                'name' => 'Paint',
                'password' => bcrypt('123456789'),
            ]
        );
        $superAdmin->syncRoles(['super-admin']);
    }
}
