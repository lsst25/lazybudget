<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\BudgetController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('auth/register', RegisterController::class);
    Route::post('auth/login', LoginController::class);
    Route::post('auth/logout', LogoutController::class)->middleware('auth:sanctum');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('budgets/{budget}', [BudgetController::class, 'show'])->middleware('can:view,budget');
    });
});
