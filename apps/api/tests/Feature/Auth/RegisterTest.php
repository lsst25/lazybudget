<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function user_can_register(): void
    {
        $response = $this->postJson('/api/v1/auth/register', $this->validPayload());

        $response->assertCreated()->assertJsonStructure(['token']);

        $this->assertDatabaseHas('users', ['email' => 'yurii@example.com']);
    }

    #[Test]
    public function registration_fails_with_duplicate_email(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $this->postJson('/api/v1/auth/register', array_merge($this->validPayload(), ['email' => 'taken@example.com']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
        $this->assertDatabaseCount('users', 1);
    }

    #[Test]
    #[DataProvider('invalidRegistrationData')]
    public function registration_fails_with_invalid_data(array $overrides, string $invalidField): void
    {
        $payload = array_merge($this->validPayload(), $overrides);

        $this->postJson('/api/v1/auth/register', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors([$invalidField]);
    }

    public static function invalidRegistrationData(): array
    {
        return [
            'name is required' => [['name' => ''], 'name'],
            'email is required' => [['email' => ''], 'email'],
            'email must be valid' => [['email' => 'not an email'], 'email'],
            'password is required' => [['password' => ''], 'password'],
            'password must be confirmed' => [['password_confirmation' => 'other'], 'password'],
            'password has a minimum' => [['password' => 'short', 'password_confirmation' => 'short'], 'password'],
        ];
    }

    private function validPayload(): array
    {
        return [
            'name' => 'Yurii',
            'email' => 'yurii@example.com',
            'password' => 'secret-password',
            'password_confirmation' => 'secret-password',
        ];
    }
}
