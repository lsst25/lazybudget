<?php

namespace Database\Factories;

use App\Enums\BudgetRole;
use App\Models\Budget;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Budget>
 */
class BudgetFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true),
            'first_month' => now()->startOfMonth()->toDateString(),
        ];
    }

    /**
     * Attach the given user as the budget's owner once it is created.
     */
    public function ownedBy(User $user): static
    {
        return $this->afterCreating(function (Budget $budget) use ($user) {
            $budget->members()->attach($user->id, ['role' => BudgetRole::Owner->value]);
        });
    }

    /**
     * Attach the given user as a plain member once the budget is created.
     */
    public function withMember(User $user): static
    {
        return $this->afterCreating(function (Budget $budget) use ($user) {
            $budget->members()->attach($user->id, ['role' => BudgetRole::Member->value]);
        });
    }
}
