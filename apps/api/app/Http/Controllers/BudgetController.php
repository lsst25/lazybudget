<?php

namespace App\Http\Controllers;

use App\Http\Resources\BudgetResource;
use App\Models\Budget;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

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
}
