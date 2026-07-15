<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\RespondsWithRawgPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreGameRequest;
use App\Http\Requests\Admin\UpdateGameRequest;
use App\Http\Resources\AdminGameResource;
use App\Models\Game;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class GameController extends Controller
{
    use RespondsWithRawgPagination;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
            'page_size' => ['nullable', 'integer', 'between:1,100'],
        ]);

        $paginator = Game::query()
            ->with(['genres', 'platforms'])
            ->when(
                trim((string) ($validated['search'] ?? '')),
                fn ($query, $search) => $query->where('name', 'like', "%{$search}%"),
            )
            ->latest('id')
            ->paginate((int) ($validated['page_size'] ?? 20))
            ->withQueryString();

        return $this->paginatedResponse($paginator, AdminGameResource::class);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGameRequest $request): JsonResponse
    {
        [$attributes, $genreIds, $platformIds] = $this->extractPayload($request->validated());

        $game = DB::transaction(function () use ($attributes, $genreIds, $platformIds): Game {
            $game = Game::query()->create($attributes);
            $game->genres()->sync($genreIds);
            $game->platforms()->sync($platformIds);

            return $game;
        });

        return response()->json(
            (new AdminGameResource($game->load(['genres', 'platforms'])))->resolve($request),
            201,
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(Game $game): AdminGameResource
    {
        return new AdminGameResource($game->load(['genres', 'platforms']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateGameRequest $request, Game $game): AdminGameResource
    {
        [$attributes, $genreIds, $platformIds] = $this->extractPayload($request->validated());

        DB::transaction(function () use ($game, $attributes, $genreIds, $platformIds): void {
            $game->update($attributes);

            if ($genreIds !== null) {
                $game->genres()->sync($genreIds);
            }

            if ($platformIds !== null) {
                $game->platforms()->sync($platformIds);
            }
        });

        return new AdminGameResource($game->refresh()->load(['genres', 'platforms']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Game $game): JsonResponse
    {
        $game->delete();

        return response()->json(['message' => 'Game deleted.']);
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array{0: array<string, mixed>, 1: ?array<int, int>, 2: ?array<int, int>}
     */
    private function extractPayload(array $validated): array
    {
        $genreIds = array_key_exists('genre_ids', $validated)
            ? array_values($validated['genre_ids'])
            : null;
        $platformIds = array_key_exists('platform_ids', $validated)
            ? array_values($validated['platform_ids'])
            : null;
        $attributes = Arr::except($validated, ['genre_ids', 'platform_ids']);

        foreach (['developers', 'publishers', 'tags', 'screenshots'] as $field) {
            if (array_key_exists($field, $attributes)) {
                $attributes[$field] = collect($attributes[$field])
                    ->map(fn (string $value) => trim($value))
                    ->filter()
                    ->unique()
                    ->values()
                    ->all();
            }
        }

        return [$attributes, $genreIds, $platformIds];
    }
}
