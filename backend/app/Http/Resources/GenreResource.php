<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GenreResource extends JsonResource
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
            'games_count' => isset($this->games_count)
                ? (int) $this->games_count
                : (int) $this->rawg_games_count,
            'rawg_games_count' => (int) $this->rawg_games_count,
            'image_background' => $this->image_background,
        ];
    }
}
