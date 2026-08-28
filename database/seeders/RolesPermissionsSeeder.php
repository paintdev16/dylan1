<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        $permissions = [
            'create users',
            'edit users',
            'delete users',
            'view users',
        ];
        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission);
        }
        $superAdmin = Role::findOrCreate('super-admin');
        $superAdmin->givePermissionTo(Permission::all());
        $admin = Role::findOrCreate('admin');
        $admin->givePermissionTo([
            'view users',
            'create users',
            'edit users',
            'delete users',
        ]);
    }
}
