<?php

namespace Tests\Feature\Budgets;

use App\Models\Budget;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ShowBudgetTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function a_member_can_view_the_budget(): void
    {
        $user = User::factory()->create();
        $budget = Budget::factory()->ownedBy($user)->create();

        $this->actingAs($user)
            ->getJson("/api/v1/budgets/{$budget->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $budget->id)
            ->assertJsonPath('data.name', $budget->name);
    }

    #[Test]
    public function a_non_member_cannot_view_the_budget(): void
    {
        $owner = User::factory()->create();
        $stranger = User::factory()->create();
        $budget = Budget::factory()->ownedBy($owner)->create();

        $this->actingAs($stranger)
            ->getJson("/api/v1/budgets/{$budget->id}")
            ->assertForbidden();
    }

    #[Test]
    public function a_guest_cannot_view_the_budget(): void
    {
        $owner = User::factory()->create();
        $budget = Budget::factory()->ownedBy($owner)->create();

        $this->getJson("/api/v1/budgets/{$budget->id}")
            ->assertUnauthorized();
    }
}
