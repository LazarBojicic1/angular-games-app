<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\RespondsWithRawgPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreGenreRequest;
use App\Http\Requests\Admin\UpdateGenreRequest;
use App\Http\Resources\GenreResource;
use App\Models\Genre;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GenreController extends Controller
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
        $paginator = Genre::query()
            ->withCount('games')
            ->when(
                trim((string) ($validated['search'] ?? '')),
                fn ($query, $search) => $query->where('name', 'like', "%{$search}%"),
            )
            ->orderBy('name')
            ->paginate((int) ($validated['page_size'] ?? 20))
            ->withQueryString();

        return $this->paginatedResponse($paginator, GenreResource::class);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGenreRequest $request): JsonResponse
    {
        $genre = Genre::query()->create([
            ...$request->validated(),
            'rawg_games_count' => $request->integer('rawg_games_count'),
        ]);

        return response()->json((new GenreResource($genre->loadCount('games')))->resolve($request), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Genre $genre): GenreResource
    {
        return new GenreResource($genre->loadCount('games'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateGenreRequest $request, Genre $genre): GenreResource
    {
        $genre->update($request->validated());

        return new GenreResource($genre->refresh()->loadCount('games'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Genre $genre): JsonResponse
    {
        $genre->delete();

        return response()->json(['message' => 'Genre deleted.']);
    }
}
