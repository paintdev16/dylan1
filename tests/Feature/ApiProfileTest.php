<?php

use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('profile api endpoints require sanctum authentication', function (string $method) {
    $this->json($method, '/api/profile')->assertUnauthorized();
})->with(['GET', 'PATCH', 'DELETE']);

test('authenticated user can retrieve their profile', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user, ['*']);

    $this->getJson(route('api.profile.show'))
        ->assertSuccessful()
        ->assertJsonPath('data.id', $user->id)
        ->assertJsonPath('data.name', $user->name)
        ->assertJsonPath('data.email', $user->email);
});

test('authenticated user can update their profile', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    Sanctum::actingAs($user, ['*']);

    $this->patchJson(route('api.profile.update'), [
        'name' => 'Usuario API',
        'email' => 'usuario.api@example.com',
    ])->assertSuccessful()
        ->assertJsonPath('data.name', 'Usuario API')
        ->assertJsonPath('data.email', 'usuario.api@example.com')
        ->assertJsonPath('data.email_verified_at', null);

    expect($user->refresh()->name)->toBe('Usuario API')
        ->and($user->email)->toBe('usuario.api@example.com')
        ->and($user->email_verified_at)->toBeNull();
});

test('email verification remains when email does not change', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    Sanctum::actingAs($user, ['*']);

    $this->patchJson(route('api.profile.update'), [
        'name' => 'Nombre actualizado',
        'email' => $user->email,
    ])->assertSuccessful();

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

test('authenticated user can delete their account and revoke all tokens', function () {
    $user = User::factory()->create();
    $currentToken = $user->createToken('Dispositivo actual')->plainTextToken;
    $user->createToken('Segundo dispositivo');

    $this->withToken($currentToken)
        ->deleteJson(route('api.profile.destroy'), ['password' => 'password'])
        ->assertSuccessful()
        ->assertJsonPath('message', 'Cuenta eliminada correctamente.');

    $this->assertModelMissing($user);
    $this->assertDatabaseMissing('personal_access_tokens', [
        'tokenable_type' => User::class,
        'tokenable_id' => $user->id,
    ]);
});

test('correct password is required to delete an account', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user, ['*']);

    $this->deleteJson(route('api.profile.destroy'), ['password' => 'incorrecta'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('password');

    $this->assertModelExists($user);
});
