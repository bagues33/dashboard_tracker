<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsappSetting extends Model
{
    protected $fillable = [
        'api_url',
        'api_token',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
