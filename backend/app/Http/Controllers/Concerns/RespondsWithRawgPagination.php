<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;

trait RespondsWithRawgPagination
{
    /** @param class-string<JsonResource> $resourceClass */
    protected function paginatedResponse(
        LengthAwarePaginator $paginator,
        string $resourceClass,
    ): JsonResponse {
        $results = $paginator->getCollection()
            ->map(fn ($item) => (new $resourceClass($item))->resolve(request()))
            ->values();

        return response()->json([
            'count' => $paginator->total(),
            'next' => $paginator->nextPageUrl(),
            'previous' => $paginator->previousPageUrl(),
            'results' => $results,
        ]);
    }
}
