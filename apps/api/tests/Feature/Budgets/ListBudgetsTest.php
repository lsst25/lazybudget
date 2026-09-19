<?php

namespace Tests\Feature\Budgets;

use App\Models\Budget;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ListBudgetsTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_lists_only_the_budgets_the_user_belongs_to(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $mine = Budget::factory()->ownedBy($user)->create();
        Budget::factory()->ownedBy($other)->create();

        $this->actingAs($user)
            ->getJson('/api/v1/budgets')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $mine->id)
            ->assertJsonPath('data.0.role', 'owner');
    }

    #[Test]
    public function a_guest_cannot_list_budgets(): void
    {
        $this->getJson('/api/v1/budgets')->assertUnauthorized();
    }
}
