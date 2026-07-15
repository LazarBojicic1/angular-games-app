<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\RespondsWithRawgPagination;
use App\Http\Controllers\Controller;
use App\Http\Resources\GameResource;
use App\Models\Game;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GameController extends Controller
{
    use RespondsWithRawgPagination;

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'genres' => ['nullable', 'string', 'max:500'],
            'platforms' => ['nullable', 'string', 'max:500'],
            'ordering' => ['nullable', 'in:-rating,-released,released,name,-metacritic'],
            'page' => ['nullable', 'integer', 'min:1'],
            'page_size' => ['nullable', 'integer', 'between:1,50'],
        ]);

        $query = Game::query()->with(['genres', 'platforms']);

        if ($search = trim((string) ($validated['search'] ?? ''))) {
            $query->where('name', 'like', "%{$search}%");
        }

        $this->applyRelationFilter($query, 'genres', $validated['genres'] ?? null);
        $this->applyRelationFilter($query, 'platforms', $validated['platforms'] ?? null);

        [$column, $direction] = match ($validated['ordering'] ?? '-rating') {
            '-released' => ['released', 'desc'],
            'released' => ['released', 'asc'],
            'name' => ['name', 'asc'],
            '-metacritic' => ['metacritic', 'desc'],
            default => ['rating', 'desc'],
        };

        $paginator = $query
            ->orderBy($column, $direction)
            ->orderBy('id')
            ->paginate((int) ($validated['page_size'] ?? 12))
            ->withQueryString();

        return $this->paginatedResponse($paginator, GameResource::class);
    }

    public function show(Game $game): GameResource
    {
        return new GameResource($game->load(['genres', 'platforms']));
    }

    public function screenshots(Game $game): JsonResponse
    {
        $screenshots = collect($game->screenshots ?? [])
            ->filter(fn ($image) => is_string($image) && trim($image) !== '')
            ->values()
            ->map(fn (string $image, int $index) => [
                'id' => $index + 1,
                'image' => $image,
            ]);

        return response()->json([
            'count' => $screenshots->count(),
            'next' => null,
            'previous' => null,
            'results' => $screenshots,
        ]);
    }

    private function applyRelationFilter(Builder $query, string $relation, ?string $csv): void
    {
        $ids = collect(explode(',', (string) $csv))
            ->filter(fn ($id) => ctype_digit(trim($id)))
            ->map(fn ($id) => (int) trim($id))
            ->unique()
            ->values();

        if ($ids->isNotEmpty()) {
            $query->whereHas($relation, fn (Builder $related) => $related->whereKey($ids));
        }
    }
}
