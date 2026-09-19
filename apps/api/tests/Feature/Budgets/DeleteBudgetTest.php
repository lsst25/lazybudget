<?php

namespace Tests\Feature\Budgets;

use App\Models\Budget;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class DeleteBudgetTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function an_owner_can_delete_the_budget(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $budget = Budget::factory()->ownedBy($owner)->withMember($member)->create();

        $this->actingAs($owner)
            ->deleteJson("/api/v1/budgets/{$budget->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('budgets', ['id' => $budget->id]);
        // Membership rows go with the budget via the FK cascade, not via Eloquent.
        $this->assertDatabaseCount('budget_members', 0);
    }

    #[Test]
    public function a_member_cannot_delete_the_budget(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $budget = Budget::factory()->ownedBy($owner)->withMember($member)->create();

        $this->actingAs($member)
            ->deleteJson("/api/v1/budgets/{$budget->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('budgets', ['id' => $budget->id]);
    }

    #[Test]
    public function a_non_member_cannot_delete_the_budget(): void
    {
        $owner = User::factory()->create();
        $stranger = User::factory()->create();
        $budget = Budget::factory()->ownedBy($owner)->create();

        $this->actingAs($stranger)
            ->deleteJson("/api/v1/budgets/{$budget->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('budgets', ['id' => $budget->id]);
    }

    #[Test]
    public function a_guest_cannot_delete_the_budget(): void
    {
        $owner = User::factory()->create();
        $budget = Budget::factory()->ownedBy($owner)->create();

        $this->deleteJson("/api/v1/budgets/{$budget->id}")
            ->assertUnauthorized();

        $this->assertDatabaseHas('budgets', ['id' => $budget->id]);
    }
}
