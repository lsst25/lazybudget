<?php

namespace Tests\Feature\Budgets;

use App\Models\Budget;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class CreateBudgetTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_creates_a_budget_and_makes_the_creator_its_owner(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/budgets', ['name' => 'Household'])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Household')
            ->assertJsonPath('data.role', 'owner');

        $budget = Budget::find($response->json('data.id'));

        $this->assertSame(now()->startOfMonth()->toDateString(), $budget->first_month->toDateString());
        $this->assertTrue($budget->owner()->whereKey($user->id)->exists());
        $this->assertDatabaseCount('budget_members', 1);
    }

    #[Test]
    public function it_requires_a_name(): void
    {
        $this->actingAs(User::factory()->create())
            ->postJson('/api/v1/budgets', ['name' => ''])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);

        $this->assertDatabaseCount('budgets', 0);
    }

    #[Test]
    public function a_guest_cannot_create_a_budget(): void
    {
        $this->postJson('/api/v1/budgets', ['name' => 'Household'])->assertUnauthorized();
    }
}
