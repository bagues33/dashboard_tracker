<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Run WhatsApp due date reminders every day at 08:00 WIB (UTC+7 = 01:00 UTC)
Schedule::command('whatsapp:send-reminders')->dailyAt('01:00');
