<?php

namespace Tests\Feature\Budgets;

use App\Models\Budget;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class UpdateBudgetTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function an_owner_can_rename_the_budget(): void
    {
        $owner = User::factory()->create();
        $budget = Budget::factory()->ownedBy($owner)->create(['name' => 'Old name']);

        $this->actingAs($owner)
            ->patchJson("/api/v1/budgets/{$budget->id}", ['name' => 'Renamed'])
            ->assertOk()
            ->assertJsonPath('data.id', $budget->id)
            ->assertJsonPath('data.name', 'Renamed');

        $this->assertDatabaseHas('budgets', ['id' => $budget->id, 'name' => 'Renamed']);
    }

    #[Test]
    public function a_member_cannot_rename_the_budget(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $budget = Budget::factory()->ownedBy($owner)->withMember($member)->create(['name' => 'Old name']);

        $this->actingAs($member)
            ->patchJson("/api/v1/budgets/{$budget->id}", ['name' => 'Renamed'])
            ->assertForbidden();

        $this->assertDatabaseHas('budgets', ['id' => $budget->id, 'name' => 'Old name']);
    }

    #[Test]
    public function a_non_member_cannot_rename_the_budget(): void
    {
        $owner = User::factory()->create();
        $stranger = User::factory()->create();
        $budget = Budget::factory()->ownedBy($owner)->create(['name' => 'Old name']);

        $this->actingAs($stranger)
            ->patchJson("/api/v1/budgets/{$budget->id}", ['name' => 'Renamed'])
            ->assertForbidden();

        $this->assertDatabaseHas('budgets', ['id' => $budget->id, 'name' => 'Old name']);
    }

    #[Test]
    public function name_cannot_be_blank(): void
    {
        $owner = User::factory()->create();
        $budget = Budget::factory()->ownedBy($owner)->create(['name' => 'Old name']);

        $this->actingAs($owner)
            ->patchJson("/api/v1/budgets/{$budget->id}", ['name' => ''])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);

        $this->assertDatabaseHas('budgets', ['id' => $budget->id, 'name' => 'Old name']);
    }

    #[Test]
    public function a_guest_cannot_rename_the_budget(): void
    {
        $owner = User::factory()->create();
        $budget = Budget::factory()->ownedBy($owner)->create();

        $this->patchJson("/api/v1/budgets/{$budget->id}", ['name' => 'Renamed'])
            ->assertUnauthorized();
    }
}
