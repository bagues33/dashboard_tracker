<?php

namespace App\Services;

use App\Models\TelegramSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    public function sendMessage(string $message): bool
    {
        $setting = TelegramSetting::where('is_active', true)->first();

        if (!$setting || !$setting->bot_token || !$setting->chat_id) {
            return false;
        }

        try {
            // Mask token for security in logs
            $maskedToken = substr($setting->bot_token, 0, 4) . '...' . substr($setting->bot_token, -4);
            
            $url = "https://api.telegram.org/bot{$setting->bot_token}/sendMessage";
            
            $response = Http::post($url, [
                'chat_id' => $setting->chat_id,
                'text' => $message,
                'parse_mode' => 'HTML',
                'disable_web_page_preview' => true,
            ]);

            if (!$response->successful()) {
                Log::error("Telegram API Error [Token: $maskedToken]: " . $response->body());
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error("Telegram Service Exception: " . $e->getMessage());
            return false;
        }
    }
}
