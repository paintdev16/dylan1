<?php

use App\Models\User;
use Database\Seeders\RolesPermissionsSeeder;
use Database\Seeders\UserTableSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RolesPermissionsSeeder::class);
});

test('root account is created as a protected super administrator', function () {
    $this->seed(UserTableSeeder::class);

    $root = User::query()->where('is_root', true)->firstOrFail();

    expect($root->email)->toBe(config('auth.root_user.email'))
        ->and($root->hasRole('super-admin'))->toBeTrue()
        ->and($root->isProtectedAccount())->toBeTrue();
});

test('users index hides root super administrators and administrators', function () {
    $actor = User::factory()->create();
    $actor->assignRole('super-admin');

    User::factory()->create(['name' => 'Root', 'is_root' => true])->assignRole('super-admin');
    User::factory()->create(['name' => 'Administrator'])->assignRole('admin');
    User::factory()->create(['name' => 'Waiter'])->assignRole('mozo');

    $this->actingAs($actor)
        ->get(route('users.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('users', 1)
            ->where('users.0.name', 'Waiter')
            ->where('pagination.total', 1));
});

test('root account cannot be updated or deleted', function () {
    $actor = User::factory()->create();
    $actor->assignRole('super-admin');
    $root = User::factory()->create(['is_root' => true]);
    $root->assignRole('super-admin');

    $this->actingAs($actor)
        ->put(route('users.update', $root), [
            'name' => 'Changed Root',
            'email' => $root->email,
            'role' => 'mozo',
        ])
        ->assertForbidden();

    $this->actingAs($actor)
        ->delete(route('users.destroy', $root))
        ->assertForbidden();

    $this->assertModelExists($root);
    expect($root->fresh()->name)->not->toBe('Changed Root');
});

test('privileged roles cannot be assigned from user management', function () {
    $actor = User::factory()->create();
    $actor->assignRole('super-admin');

    $this->actingAs($actor)
        ->post(route('users.store'), [
            'name' => 'New Administrator',
            'email' => 'new-admin@example.com',
            'password' => 'password123',
            'role' => 'admin',
        ])
        ->assertSessionHasErrors('role');

    expect(User::query()->where('email', 'new-admin@example.com')->exists())->toBeFalse();
});
