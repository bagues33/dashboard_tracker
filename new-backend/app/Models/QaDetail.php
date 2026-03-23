<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QaDetail extends Model
{
    protected $fillable = [
        'checklist_id', 'title', 'status', 'priority',
        'expected_result', 'steps_to_reproduce', 'image_url', 'error_url', 'position', 'assigned_to'
    ];

    public function checklist()
    {
        return $this->belongsTo(Checklist::class);
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    // Returns progress percent based on status
    public static function statusToPercent(string $status): int
    {
        return match($status) {
            'to do'      => 0,
            'in progress'=> 25,
            'done dev'   => 50,
            're open'    => 10,
            'done'       => 100,
            default      => 0,
        };
    }
}
