<?php

namespace App\Services;

use App\Models\WhatsappSetting;
use App\Models\NotificationLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsappService
{
    public function sendMessage($to, $message, $userId = null, $context = null, $cardId = null, $taskType = null, $purpose = null)
    {
        $setting = WhatsappSetting::first();

        if (!$setting || !$setting->is_active) {
            Log::info('WhatsApp notification skipped: Service not configured or inactive.');
            return false;
        }

        if (empty($to)) {
            Log::info('WhatsApp notification skipped: Recipient phone number is empty.');
            return false;
        }

        $logData = [
            'user_id' => $userId,
            'type' => 'whatsapp',
            'recipient' => $to,
            'content' => $message,
            'context' => $context,
            'card_id' => $cardId,
            'task_type' => $taskType,
            'purpose' => $purpose,
        ];

        try {
            $response = Http::withHeaders([
                'Authorization' => $setting->api_token,
            ])->post($setting->api_url, [
                'target' => $to,
                'message' => $message,
            ]);

            if ($response->successful()) {
                Log::info("WhatsApp message sent to $to: $message");
                NotificationLog::create(array_merge($logData, ['status' => 'sent']));
                return true;
            }

            $errorMessage = $response->body();
            Log::error("WhatsApp API error: " . $errorMessage);
            NotificationLog::create(array_merge($logData, [
                'status' => 'failed',
                'error_message' => $errorMessage
            ]));
            return false;
        } catch (\Exception $e) {
            $errorMessage = $e->getMessage();
            Log::error("WhatsApp service exception: " . $errorMessage);
            NotificationLog::create(array_merge($logData, [
                'status' => 'failed',
                'error_message' => $errorMessage
            ]));
            return false;
        }
    }
}
