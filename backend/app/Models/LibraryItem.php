<?php

namespace App\Models;

use Database\Factories\LibraryItemFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LibraryItem extends Model
{
    /** @use HasFactory<LibraryItemFactory> */
    use HasFactory;

    public const FAVORITE = 'favorite';

    public const PLAY_LATER = 'play_later';

    protected $fillable = ['user_id', 'game_id', 'list_type'];

    public static function normalizeType(?string $type): ?string
    {
        return match ($type) {
            'favorite', 'favorites' => self::FAVORITE,
            'play_later', 'play-later' => self::PLAY_LATER,
            default => null,
        };
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }
}
