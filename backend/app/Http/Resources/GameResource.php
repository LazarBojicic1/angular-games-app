<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class GameResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'rawg_id' => $this->rawg_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'background_image' => $this->background_image,
            'rating' => (float) $this->rating,
            'released' => $this->released?->format('Y-m-d'),
            'metacritic' => $this->metacritic,
            'playtime' => (int) $this->playtime,
            'genres' => GenreResource::collection($this->whenLoaded('genres')),
            'platforms' => $this->whenLoaded('platforms', fn () => $this->platforms
                ->map(fn ($platform) => [
                    'platform' => (new PlatformResource($platform))->resolve($request),
                ])
                ->values()),
            'description_raw' => $this->description ?? '',
            'website' => $this->website ?? '',
            'developers' => $this->namedEntities($this->developers),
            'publishers' => $this->namedEntities($this->publishers),
            'tags' => $this->namedEntities($this->tags),
            'screenshots' => $this->screenshotEntities($this->screenshots),
        ];
    }

    /** @return array<int, array{id: int, name: string, slug: string}> */
    private function namedEntities(?array $names): array
    {
        return collect($names ?? [])
            ->filter(fn ($name) => is_string($name) && trim($name) !== '')
            ->values()
            ->map(fn (string $name, int $index) => [
                'id' => $index + 1,
                'name' => $name,
                'slug' => Str::slug($name),
            ])
            ->all();
    }

    /** @return array<int, array{id: int, image: string}> */
    private function screenshotEntities(?array $screenshots): array
    {
        return collect($screenshots ?? [])
            ->filter(fn ($image) => is_string($image) && trim($image) !== '')
            ->values()
            ->map(fn (string $image, int $index) => [
                'id' => $index + 1,
                'image' => $image,
            ])
            ->all();
    }
}
