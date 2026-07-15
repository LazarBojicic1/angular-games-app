<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\RespondsWithRawgPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePlatformRequest;
use App\Http\Requests\Admin\UpdatePlatformRequest;
use App\Http\Resources\PlatformResource;
use App\Models\Platform;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlatformController extends Controller
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
        $paginator = Platform::query()
            ->withCount('games')
            ->when(
                trim((string) ($validated['search'] ?? '')),
                fn ($query, $search) => $query->where('name', 'like', "%{$search}%"),
            )
            ->orderBy('name')
            ->paginate((int) ($validated['page_size'] ?? 20))
            ->withQueryString();

        return $this->paginatedResponse($paginator, PlatformResource::class);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePlatformRequest $request): JsonResponse
    {
        $platform = Platform::query()->create([
            ...$request->validated(),
            'rawg_games_count' => $request->integer('rawg_games_count'),
        ]);

        return response()->json((new PlatformResource($platform->loadCount('games')))->resolve($request), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Platform $platform): PlatformResource
    {
        return new PlatformResource($platform->loadCount('games'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePlatformRequest $request, Platform $platform): PlatformResource
    {
        $platform->update($request->validated());

        return new PlatformResource($platform->refresh()->loadCount('games'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Platform $platform): JsonResponse
    {
        $platform->delete();

        return response()->json(['message' => 'Platform deleted.']);
    }
}
