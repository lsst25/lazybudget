<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisterController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('auth/register', RegisterController::class);
    Route::post('auth/login', LoginController::class);
    Route::post('auth/logout', LogoutController::class)->middleware('auth:sanctum');
});
