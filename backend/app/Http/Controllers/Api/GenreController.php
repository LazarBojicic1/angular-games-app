<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\RespondsWithRawgPagination;
use App\Http\Controllers\Controller;
use App\Http\Resources\GenreResource;
use App\Models\Genre;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GenreController extends Controller
{
    use RespondsWithRawgPagination;

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page' => ['nullable', 'integer', 'min:1'],
            'page_size' => ['nullable', 'integer', 'between:1,100'],
        ]);
        $paginator = Genre::query()
            ->withCount('games')
            ->orderBy('name')
            ->paginate((int) ($validated['page_size'] ?? 20))
            ->withQueryString();

        return $this->paginatedResponse($paginator, GenreResource::class);
    }

    public function show(Genre $genre): GenreResource
    {
        return new GenreResource($genre->loadCount('games'));
    }
}
