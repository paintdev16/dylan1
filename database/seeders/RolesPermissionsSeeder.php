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
            'manage catalog',
            'manage daily menu',
            'manage tables',
            'open tables',
            'manage orders',
            'manage kitchen',
            'manage cash register',
            'view bills',
            'manage inventory',
            'approve cancellations',
            'view reports',
        ];
        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission);
        }
        $superAdmin = Role::findOrCreate('super-admin');
        $superAdmin->syncPermissions(Permission::all());
        $admin = Role::findOrCreate('admin');
        $admin->syncPermissions(Permission::all());

        Role::findOrCreate('mozo')->syncPermissions([
            'manage tables', 'open tables', 'manage orders', 'view bills',
        ]);
        Role::findOrCreate('cocina')->syncPermissions(['manage kitchen']);
        Role::findOrCreate('cajero')->syncPermissions([
            'manage cash register', 'view bills', 'approve cancellations',
        ]);
    }
}
