<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class RawgService
{
    /** @return array<string, mixed> */
    public function genres(int $pageSize = 40): array
    {
        return $this->get('genres', ['page_size' => $pageSize]);
    }

    /** @return array<string, mixed> */
    public function platforms(int $pageSize = 40): array
    {
        return $this->get('platforms', ['page_size' => $pageSize]);
    }

    /** @return array<string, mixed> */
    public function games(int $page, int $pageSize, string $ordering): array
    {
        return $this->get('games', [
            'page' => $page,
            'page_size' => $pageSize,
            'ordering' => $ordering,
        ]);
    }

    /** @return array<string, mixed> */
    public function game(int $rawgId): array
    {
        return $this->get("games/{$rawgId}");
    }

    /** @return array<string, mixed> */
    public function screenshots(int $rawgId): array
    {
        return $this->get("games/{$rawgId}/screenshots");
    }

    /**
     * @param  array<string, scalar|null>  $query
     * @return array<string, mixed>
     */
    private function get(string $path, array $query = []): array
    {
        $response = $this->client()->get($path, [
            ...$query,
            'key' => config('services.rawg.key'),
        ]);

        return $response->throw()->json();
    }

    private function client(): PendingRequest
    {
        if (! config('services.rawg.key')) {
            throw new RuntimeException('RAWG_API_KEY is missing from the environment.');
        }

        return Http::baseUrl(rtrim((string) config('services.rawg.url'), '/'))
            ->acceptJson()
            ->timeout(20)
            ->retry(3, 300);
    }
}
