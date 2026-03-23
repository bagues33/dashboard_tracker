<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TelegramSetting extends Model
{
    protected $fillable = [
        'bot_token',
        'chat_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
