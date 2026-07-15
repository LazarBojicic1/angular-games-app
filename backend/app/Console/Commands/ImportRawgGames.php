<?php

namespace App\Console\Commands;

use App\Models\Game;
use App\Models\Genre;
use App\Models\Platform;
use App\Services\RawgService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

#[Signature('games:import
    {--pages=1 : Number of RAWG pages (1-5)}
    {--page-size=12 : Games per page (1-40)}
    {--ordering=-added : RAWG ordering value}')]
#[Description('Import a small, idempotent game catalog from RAWG into MySQL')]
class ImportRawgGames extends Command
{
    public function handle(RawgService $rawg): int
    {
        $pages = min(5, max(1, (int) $this->option('pages')));
        $pageSize = min(40, max(1, (int) $this->option('page-size')));
        $ordering = (string) $this->option('ordering');

        try {
            $this->importDictionaries($rawg);
        } catch (Throwable $exception) {
            $this->error("RAWG dictionaries could not be loaded: {$exception->getMessage()}");

            return self::FAILURE;
        }

        $imported = 0;

        for ($page = 1; $page <= $pages; $page++) {
            try {
                $response = $rawg->games($page, $pageSize, $ordering);
            } catch (Throwable $exception) {
                $this->error("RAWG page {$page} failed: {$exception->getMessage()}");

                return self::FAILURE;
            }

            $summaries = Arr::wrap($response['results'] ?? []);
            $bar = $this->output->createProgressBar(count($summaries));
            $bar->start();

            foreach ($summaries as $summary) {
                if (! is_array($summary) || empty($summary['id']) || empty($summary['name'])) {
                    $bar->advance();

                    continue;
                }

                $rawgId = (int) $summary['id'];
                $details = $summary;
                $screenshots = [];
                $detailsLoaded = false;
                $screenshotsLoaded = false;

                try {
                    $details = [...$summary, ...$rawg->game($rawgId)];
                    $detailsLoaded = true;
                } catch (Throwable $exception) {
                    $this->newLine();
                    $this->warn("Details unavailable for RAWG #{$rawgId}; importing list data.");
                }

                try {
                    $screenshots = collect($rawg->screenshots($rawgId)['results'] ?? [])
                        ->pluck('image')
                        ->filter(fn ($image) => is_string($image) && $image !== '')
                        ->take(6)
                        ->values()
                        ->all();
                    $screenshotsLoaded = true;
                } catch (Throwable) {
                    $screenshots = [];
                }

                $this->upsertGame(
                    $summary,
                    $details,
                    $screenshots,
                    $detailsLoaded,
                    $screenshotsLoaded,
                );
                $imported++;
                $bar->advance();
            }

            $bar->finish();
            $this->newLine();

            if (empty($response['next'])) {
                break;
            }
        }

        $this->info("Imported or updated {$imported} games.");

        return self::SUCCESS;
    }

    private function importDictionaries(RawgService $rawg): void
    {
        foreach ($rawg->genres()['results'] ?? [] as $data) {
            if (is_array($data)) {
                $this->upsertGenre($data);
            }
        }

        foreach ($rawg->platforms()['results'] ?? [] as $data) {
            if (is_array($data)) {
                $this->upsertPlatform($data);
            }
        }
    }

    /** @param array<string, mixed> $data */
    private function upsertGenre(array $data): ?Genre
    {
        if (empty($data['name'])) {
            return null;
        }

        $slug = (string) ($data['slug'] ?? Str::slug((string) $data['name']));
        $genre = Genre::query()
            ->when($data['id'] ?? null, fn ($query, $id) => $query->where('rawg_id', $id))
            ->orWhere('slug', $slug)
            ->first() ?? new Genre;

        $genre->fill([
            'rawg_id' => isset($data['id']) ? (int) $data['id'] : $genre->rawg_id,
            'name' => (string) $data['name'],
            'slug' => $slug,
            'rawg_games_count' => max(0, (int) ($data['games_count'] ?? 0)),
            'image_background' => $data['image_background'] ?? null,
        ])->save();

        return $genre;
    }

    /** @param array<string, mixed> $data */
    private function upsertPlatform(array $data): ?Platform
    {
        if (empty($data['name'])) {
            return null;
        }

        $slug = (string) ($data['slug'] ?? Str::slug((string) $data['name']));
        $platform = Platform::query()
            ->when($data['id'] ?? null, fn ($query, $id) => $query->where('rawg_id', $id))
            ->orWhere('slug', $slug)
            ->first() ?? new Platform;

        $platform->fill([
            'rawg_id' => isset($data['id']) ? (int) $data['id'] : $platform->rawg_id,
            'name' => (string) $data['name'],
            'slug' => $slug,
            'rawg_games_count' => max(0, (int) ($data['games_count'] ?? 0)),
            'image_background' => $data['image_background'] ?? null,
        ])->save();

        return $platform;
    }

    /**
     * @param  array<string, mixed>  $summary
     * @param  array<string, mixed>  $details
     * @param  array<int, string>  $screenshots
     */
    private function upsertGame(
        array $summary,
        array $details,
        array $screenshots,
        bool $detailsLoaded,
        bool $screenshotsLoaded,
    ): void {
        DB::transaction(function () use (
            $summary,
            $details,
            $screenshots,
            $detailsLoaded,
            $screenshotsLoaded,
        ): void {
            $rawgId = (int) $summary['id'];
            $slug = (string) ($details['slug'] ?? $summary['slug'] ?? Str::slug((string) $summary['name']));
            $game = Game::query()
                ->where('rawg_id', $rawgId)
                ->orWhere('slug', $slug)
                ->first() ?? new Game;
            $isNewGame = ! $game->exists;
            $attributes = [
                'rawg_id' => $rawgId,
                'name' => (string) ($details['name'] ?? $summary['name']),
                'slug' => $slug,
                'background_image' => $details['background_image']
                    ?? $summary['background_image']
                    ?? $game->background_image,
                'released' => $details['released'] ?? $game->released?->format('Y-m-d'),
                'rating' => min(5, max(0, (float) ($details['rating'] ?? $game->rating ?? 0))),
            ];

            if ($detailsLoaded || $isNewGame) {
                $attributes = [
                    ...$attributes,
                    'description' => $details['description_raw'] ?? null,
                    'website' => ($details['website'] ?? null) ?: null,
                    'metacritic' => isset($details['metacritic'])
                        ? min(100, max(0, (int) $details['metacritic']))
                        : null,
                    'playtime' => min(65535, max(0, (int) ($details['playtime'] ?? 0))),
                    'developers' => $this->names($details['developers'] ?? []),
                    'publishers' => $this->names($details['publishers'] ?? []),
                    'tags' => array_slice($this->names($details['tags'] ?? []), 0, 60),
                ];
            }

            if ($screenshotsLoaded || $isNewGame) {
                $attributes['screenshots'] = $screenshots;
            }

            $game->fill($attributes)->save();

            $genreIds = collect($details['genres'] ?? $summary['genres'] ?? [])
                ->map(fn ($data) => is_array($data) ? $this->upsertGenre($data)?->id : null)
                ->filter()
                ->unique();
            $platformIds = collect($details['platforms'] ?? $summary['platforms'] ?? [])
                ->map(function ($wrapper) {
                    $data = is_array($wrapper) ? ($wrapper['platform'] ?? $wrapper) : null;

                    return is_array($data) ? $this->upsertPlatform($data)?->id : null;
                })
                ->filter()
                ->unique();

            if ($genreIds->isNotEmpty()) {
                $game->genres()->sync($genreIds);
            }

            if ($platformIds->isNotEmpty()) {
                $game->platforms()->sync($platformIds);
            }
        });
    }

    /** @return array<int, string> */
    private function names(mixed $items): array
    {
        return collect(is_array($items) ? $items : [])
            ->map(fn ($item) => is_array($item) ? ($item['name'] ?? null) : $item)
            ->filter(fn ($name) => is_string($name) && trim($name) !== '')
            ->map(fn (string $name) => trim($name))
            ->unique()
            ->values()
            ->all();
    }
}
