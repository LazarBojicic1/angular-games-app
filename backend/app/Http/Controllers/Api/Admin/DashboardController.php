<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\Genre;
use App\Models\LibraryItem;
use App\Models\Platform;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'users' => User::query()->count(),
            'games' => Game::query()->count(),
            'genres' => Genre::query()->count(),
            'platforms' => Platform::query()->count(),
            'favorites' => LibraryItem::query()->where('list_type', LibraryItem::FAVORITE)->count(),
            'play_later' => LibraryItem::query()->where('list_type', LibraryItem::PLAY_LATER)->count(),
        ]);
    }
}
