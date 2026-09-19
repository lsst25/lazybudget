<?php

namespace App\Policies;

use App\Models\Budget;
use App\Models\User;

class BudgetPolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Budget $budget): bool
    {
        return $budget->members()->whereKey($user->id)->exists();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Budget $budget): bool
    {
        return $budget->owner()->whereKey($user->id)->exists();
    }
}
