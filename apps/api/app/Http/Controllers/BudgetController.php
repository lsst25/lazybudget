<?php

namespace App\Http\Controllers;

use App\Enums\BudgetRole;
use App\Http\Requests\StoreBudgetRequest;
use App\Http\Resources\BudgetResource;
use App\Models\Budget;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class BudgetController extends Controller
{
    public function show(Budget $budget): BudgetResource
    {
        return new BudgetResource($budget);
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return BudgetResource::collection(
            $request->user()->budgets()->orderBy('name')->get()
        );
    }

    public function store(StoreBudgetRequest $request): JsonResponse
    {
        $user = $request->user();

        $budget = DB::transaction(function () use ($request, $user): Budget {
            $budget = Budget::create([
                'name' => $request->validated('name'),
                'first_month' => $request->validated('first_month') ?? now()->startOfMonth(),
            ]);

            $budget->members()->attach($user->id, ['role' => BudgetRole::Owner->value]);

            return $budget;
        });

        $withRole = $user->budgets()->findOrFail($budget->id);

        return (new BudgetResource($withRole))
            ->response()
            ->setStatusCode(201);
    }
}
