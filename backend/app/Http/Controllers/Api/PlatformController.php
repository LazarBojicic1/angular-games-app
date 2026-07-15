<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\RespondsWithRawgPagination;
use App\Http\Controllers\Controller;
use App\Http\Resources\PlatformResource;
use App\Models\Platform;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlatformController extends Controller
{
    use RespondsWithRawgPagination;

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page' => ['nullable', 'integer', 'min:1'],
            'page_size' => ['nullable', 'integer', 'between:1,100'],
        ]);
        $paginator = Platform::query()
            ->withCount('games')
            ->orderBy('name')
            ->paginate((int) ($validated['page_size'] ?? 20))
            ->withQueryString();

        return $this->paginatedResponse($paginator, PlatformResource::class);
    }

    public function show(Platform $platform): PlatformResource
    {
        return new PlatformResource($platform->loadCount('games'));
    }
}
