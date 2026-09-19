<?php

namespace App\Http\Controllers;

use App\Http\Resources\BudgetResource;
use App\Models\Budget;

class BudgetController extends Controller
{
    public function show(Budget $budget): BudgetResource
    {
        return new BudgetResource($budget);
    }
}
