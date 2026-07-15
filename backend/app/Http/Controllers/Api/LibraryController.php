<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\GameResource;
use App\Http\Resources\LibraryItemResource;
use App\Models\Game;
use App\Models\LibraryItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class LibraryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if ($request->filled('type')) {
            return $this->forType($request, $request->string('type')->toString());
        }

        return response()->json([
            'favorites' => $this->gameResults($request, LibraryItem::FAVORITE),
            'play_later' => $this->gameResults($request, LibraryItem::PLAY_LATER),
        ]);
    }

    public function forType(Request $request, string $type): JsonResponse
    {
        $normalized = $this->validatedType($type);
        $results = $this->gameResults($request, $normalized);

        return response()->json([
            'count' => count($results),
            'results' => $results,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'game_id' => ['required', 'integer', 'exists:games,id'],
            'list_type' => ['required', 'string'],
        ]);

        return $this->add(
            $request,
            (string) $validated['list_type'],
            Game::query()->findOrFail($validated['game_id']),
        );
    }

    public function add(Request $request, string $type, Game $game): JsonResponse
    {
        $item = LibraryItem::query()->firstOrCreate([
            'user_id' => $request->user()->id,
            'game_id' => $game->id,
            'list_type' => $this->validatedType($type),
        ]);

        $item->load('game.genres', 'game.platforms');

        return response()->json([
            'message' => $item->wasRecentlyCreated
                ? 'Game added to library.'
                : 'Game is already in this list.',
            'item' => (new LibraryItemResource($item))->resolve($request),
        ], $item->wasRecentlyCreated ? 201 : 200);
    }

    public function remove(Request $request, string $type, Game $game): JsonResponse
    {
        LibraryItem::query()
            ->where('user_id', $request->user()->id)
            ->where('game_id', $game->id)
            ->where('list_type', $this->validatedType($type))
            ->delete();

        return response()->json(['message' => 'Game removed from library.']);
    }

    public function destroy(Request $request, LibraryItem $libraryItem): JsonResponse
    {
        abort_unless($libraryItem->user_id === $request->user()->id, 404);
        $libraryItem->delete();

        return response()->json(['message' => 'Library item deleted.']);
    }

    /** @return array<int, mixed> */
    private function gameResults(Request $request, string $type): array
    {
        $games = LibraryItem::query()
            ->where('user_id', $request->user()->id)
            ->where('list_type', $type)
            ->with(['game.genres', 'game.platforms'])
            ->latest()
            ->get()
            ->pluck('game')
            ->filter()
            ->values();

        return GameResource::collection($games)->resolve($request);
    }

    private function validatedType(string $type): string
    {
        $normalized = LibraryItem::normalizeType($type);

        if (! $normalized) {
            throw ValidationException::withMessages([
                'type' => ['Use favorite, favorites, play_later or play-later.'],
            ]);
        }

        return $normalized;
    }
}
