<?php

namespace App\Models;

use App\Enums\BudgetRole;
use Database\Factories\BudgetFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable('name', 'first_month')]
class Budget extends Model
{
    /** @use HasFactory<BudgetFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'first_month' => 'date',
        ];
    }

    /**
     * Every user who can access this budget, with their role on the pivot.
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'budget_members')
            ->withPivot('role', 'created_at');
    }

    /**
     * The members whose role is owner.
     */
    public function owner(): BelongsToMany
    {
        return $this->members()->wherePivot('role', BudgetRole::Owner->value);
    }
}
