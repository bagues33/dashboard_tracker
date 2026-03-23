<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Card extends Model
{
    protected $fillable = ['card_list_id', 'title', 'description', 'position', 'assigned_to', 'due_date', 'priority', 'reopen_count'];

    protected static function booted()
    {
        static::saved(function ($card) {
            app(\App\Services\NotificationScheduler::class)->syncScheduledReminders($card);
        });
    }

    public function cardList()
    {
        return $this->belongsTo(CardList::class);
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function activities()
    {
        return $this->hasMany(Activity::class)->orderBy('created_at', 'desc');
    }

    public function labels()
    {
        return $this->hasMany(Label::class);
    }

    public function checklists()
    {
        return $this->hasMany(Checklist::class)->orderBy('position');
    }
}
