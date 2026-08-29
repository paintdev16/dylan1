<?php

use App\Models\User;

test('a user can obtain a sanctum token with valid credentials', function () {
    $user = User::factory()->create([
        'email' => 'cajero@example.com',
        'password' => 'password',
    ]);

    $response = $this->postJson(route('api.auth.login'), [
        'email' => $user->email,
        'password' => 'password',
        'device_name' => 'Caja principal',
    ]);

    $response->assertSuccessful()
        ->assertJsonPath('token_type', 'Bearer')
        ->assertJsonPath('user.id', $user->id)
        ->assertJsonPath('user.email', $user->email)
        ->assertJsonStructure(['access_token', 'user' => ['id', 'name', 'email', 'roles']]);

    expect($user->tokens()->where('name', 'Caja principal')->exists())->toBeTrue();
});

test('invalid credentials do not issue a token', function () {
    $user = User::factory()->create(['password' => 'password']);

    $this->postJson(route('api.auth.login'), [
        'email' => $user->email,
        'password' => 'incorrect-password',
        'device_name' => 'Tablet del mozo',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('email');

    expect($user->tokens()->count())->toBe(0);
});

test('login validates the required credentials and device name', function () {
    $this->postJson(route('api.auth.login'), [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['email', 'password', 'device_name']);
});

test('an authenticated user can retrieve their profile', function () {
    $user = User::factory()->create();
    $plainTextToken = $user->createToken('Aplicación móvil')->plainTextToken;

    $this->withToken($plainTextToken)
        ->getJson(route('api.auth.me'))
        ->assertSuccessful()
        ->assertJsonPath('data.id', $user->id)
        ->assertJsonPath('data.email', $user->email);
});

test('protected authentication routes reject unauthenticated requests', function () {
    $this->getJson(route('api.auth.me'))->assertUnauthorized();
    $this->postJson(route('api.auth.logout'))->assertUnauthorized();
});

test('logout revokes only the current sanctum token', function () {
    $user = User::factory()->create();
    $currentToken = $user->createToken('Celular')->plainTextToken;
    $user->createToken('Tablet');

    $this->withToken($currentToken)
        ->postJson(route('api.auth.logout'))
        ->assertSuccessful()
        ->assertJsonPath('message', 'Sesión cerrada correctamente.');

    expect($user->tokens()->pluck('name')->all())->toBe(['Tablet']);
    $this->app['auth']->forgetGuards();
    $this->withToken($currentToken)->getJson(route('api.auth.me'))->assertUnauthorized();
});

test('logging in again on the same device replaces its previous token', function () {
    $user = User::factory()->create(['password' => 'password']);
    $user->createToken('Caja principal');
    $user->createToken('Tablet');

    $this->postJson(route('api.auth.login'), [
        'email' => $user->email,
        'password' => 'password',
        'device_name' => 'Caja principal',
    ])->assertSuccessful();

    expect($user->tokens()->where('name', 'Caja principal')->count())->toBe(1)
        ->and($user->tokens()->where('name', 'Tablet')->count())->toBe(1);
});
