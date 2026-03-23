<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    protected $fillable = ['role', 'permission_key', 'is_enabled'];

    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
        ];
    }
}
