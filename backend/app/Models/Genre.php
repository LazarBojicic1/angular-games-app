<?php

namespace App\Models;

use Database\Factories\GenreFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Genre extends Model
{
    /** @use HasFactory<GenreFactory> */
    use HasFactory;

    protected $fillable = [
        'rawg_id',
        'name',
        'slug',
        'rawg_games_count',
        'image_background',
    ];

    protected function casts(): array
    {
        return [
            'rawg_id' => 'integer',
            'rawg_games_count' => 'integer',
        ];
    }

    public function games(): BelongsToMany
    {
        return $this->belongsToMany(Game::class);
    }
}
