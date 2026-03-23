<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccessGroup extends Model
{
    protected $fillable = ['name', 'permissions'];

    protected $casts = [
        'permissions' => 'array',
    ];

    public function boards()
    {
        return $this->belongsToMany(Board::class, 'board_user')->withTimestamps();
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'board_user')->withTimestamps();
    }
}
