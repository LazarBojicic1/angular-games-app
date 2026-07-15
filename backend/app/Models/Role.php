<?php

namespace App\Models;

use Database\Factories\RoleFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    /** @use HasFactory<RoleFactory> */
    use HasFactory;

    public const ADMIN = 'admin';

    public const USER = 'user';

    protected $fillable = ['name', 'label'];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
