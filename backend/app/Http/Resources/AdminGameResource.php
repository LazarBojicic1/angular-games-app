<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminGameResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'rawg_id' => $this->rawg_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'background_image' => $this->background_image,
            'description' => $this->description,
            'description_raw' => $this->description,
            'website' => $this->website,
            'released' => $this->released?->format('Y-m-d'),
            'rating' => (float) $this->rating,
            'metacritic' => $this->metacritic,
            'playtime' => (int) $this->playtime,
            'developers' => array_values($this->developers ?? []),
            'publishers' => array_values($this->publishers ?? []),
            'tags' => array_values($this->tags ?? []),
            'screenshots' => array_values($this->screenshots ?? []),
            'genre_ids' => $this->whenLoaded('genres', fn () => $this->genres->pluck('id')->values()),
            'platform_ids' => $this->whenLoaded('platforms', fn () => $this->platforms->pluck('id')->values()),
            'genres' => GenreResource::collection($this->whenLoaded('genres')),
            'platforms' => PlatformResource::collection($this->whenLoaded('platforms')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
