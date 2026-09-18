<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function user_can_login(): void
    {
        $user = User::factory()->create(['password' => 'secret-password']);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'secret-password',
        ])
            ->assertOk()
            ->assertJsonStructure(['token']);

        $this->assertIsString($response->json('token'));

        $this->withToken($response->json('token'))
            ->postJson('/api/v1/auth/logout')
            ->assertNoContent();
    }

    #[Test]
    public function login_fails_with_wrong_password(): void
    {
        $user = User::factory()->create(['password' => 'secret-password']);

        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    #[Test]
    public function login_fails_with_unknown_email(): void
    {
        User::factory()->create(['password' => 'secret-password']);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'unknown@example.com',
            'password' => 'secret-password',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    #[Test]
    #[DataProvider('invalidLoginData')]
    public function login_fails_with_invalid_data(array $overrides, string $invalidField): void
    {
        $user = User::factory()->create(['password' => 'secret-password']);

        $payload = array_merge(['email' => $user->email, 'password' => 'secret-password'], $overrides);

        $this->postJson('/api/v1/auth/login', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors([$invalidField]);
    }

    public static function invalidLoginData(): array
    {
        return [
            'email is required' => [['email' => ''], 'email'],
            'email must be valid' => [['email' => 'not an email'], 'email'],
            'password is required' => [['password' => ''], 'password'],
        ];
    }
}
