<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LibraryItemResource extends JsonResource
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
            'list_type' => $this->list_type,
            'game' => new GameResource($this->whenLoaded('game')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
