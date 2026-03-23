<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Board extends Model
{
    protected $fillable = ['name', 'description', 'owner_id'];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function assignedUsers()
    {
        return $this->belongsToMany(User::class)
            ->withPivot(['access_group_id', 'can_view', 'can_create', 'can_edit', 'can_delete'])
            ->withTimestamps();
    }

    public function cardLists()
    {
        return $this->hasMany(CardList::class)->orderBy('position');
    }
}
