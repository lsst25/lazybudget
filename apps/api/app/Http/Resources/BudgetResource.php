<?php

namespace App\Http\Resources;

use App\Models\Budget;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Budget
 */
class BudgetResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'first_month' => $this->first_month->toDateString(),
            'created_at' => $this->created_at?->toISOString(),
            'role' => $this->whenPivotLoaded('budget_members', fn () => $this->pivot->role),
        ];
    }
}
