<?php

use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\GameController as AdminGameController;
use App\Http\Controllers\Api\Admin\GenreController as AdminGenreController;
use App\Http\Controllers\Api\Admin\PlatformController as AdminPlatformController;
use App\Http\Controllers\Api\Admin\RoleController as AdminRoleController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GameController;
use App\Http\Controllers\Api\GenreController;
use App\Http\Controllers\Api\LibraryController;
use App\Http\Controllers\Api\PlatformController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

// Laravel-style aliases kept for simple clients and API demonstrations.
Route::post('register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('user', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);
});

Route::get('games', [GameController::class, 'index']);
Route::get('games/{game}/screenshots', [GameController::class, 'screenshots']);
Route::get('games/{game}', [GameController::class, 'show']);
Route::get('genres', [GenreController::class, 'index']);
Route::get('genres/{genre}', [GenreController::class, 'show']);
Route::get('platforms', [PlatformController::class, 'index']);
Route::get('platforms/{platform}', [PlatformController::class, 'show']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('library', [LibraryController::class, 'index']);
    Route::post('library', [LibraryController::class, 'store']);
    Route::delete('library/items/{libraryItem}', [LibraryController::class, 'destroy']);

    Route::get('library/{type}', [LibraryController::class, 'forType'])
        ->where('type', 'favorite|favorites|play_later|play-later');
    Route::put('library/{type}/{game}', [LibraryController::class, 'add'])
        ->where('type', 'favorite|favorites|play_later|play-later');
    Route::delete('library/{type}/{game}', [LibraryController::class, 'remove'])
        ->where('type', 'favorite|favorites|play_later|play-later');
});

Route::prefix('admin')
    ->middleware(['auth:sanctum', 'admin'])
    ->group(function (): void {
        Route::get('dashboard', DashboardController::class);
        Route::apiResource('games', AdminGameController::class);
        Route::apiResource('genres', AdminGenreController::class);
        Route::apiResource('platforms', AdminPlatformController::class);
        Route::apiResource('users', AdminUserController::class);
        Route::apiResource('roles', AdminRoleController::class);
    });
