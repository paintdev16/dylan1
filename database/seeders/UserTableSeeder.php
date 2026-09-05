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
        $root = User::updateOrCreate(
            ['email' => 'paint@gmail.com'],
            [
                'name' => 'Paint',
                'password' => bcrypt('123456789'),
                'email_verified_at' => now(),
                'is_root' => true,
            ]
        );

        $root->syncRoles(['super-admin']);
    }
}
