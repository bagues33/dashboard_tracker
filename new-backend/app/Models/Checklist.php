<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Checklist extends Model
{
    protected $fillable = ['card_id', 'content', 'is_completed', 'status', 'position', 'priority', 'expected_result', 'steps_to_reproduce', 'image_url', 'error_url', 'assigned_to'];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'is_completed' => 'boolean',
        ];
    }

    public function card()
    {
        return $this->belongsTo(Card::class);
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function qaDetails()
    {
        return $this->hasMany(QaDetail::class)->orderBy('position');
    }
}
