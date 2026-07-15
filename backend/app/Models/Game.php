<?php

namespace App\Models;

use Database\Factories\GameFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Game extends Model
{
    /** @use HasFactory<GameFactory> */
    use HasFactory;

    protected $fillable = [
        'rawg_id',
        'name',
        'slug',
        'background_image',
        'description',
        'website',
        'released',
        'rating',
        'metacritic',
        'playtime',
        'developers',
        'publishers',
        'tags',
        'screenshots',
    ];

    protected function casts(): array
    {
        return [
            'rawg_id' => 'integer',
            'released' => 'date:Y-m-d',
            'rating' => 'float',
            'metacritic' => 'integer',
            'playtime' => 'integer',
            'developers' => 'array',
            'publishers' => 'array',
            'tags' => 'array',
            'screenshots' => 'array',
        ];
    }

    public function genres(): BelongsToMany
    {
        return $this->belongsToMany(Genre::class);
    }

    public function platforms(): BelongsToMany
    {
        return $this->belongsToMany(Platform::class);
    }

    public function libraryItems(): HasMany
    {
        return $this->hasMany(LibraryItem::class);
    }
}
