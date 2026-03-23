<?php

namespace App\Services;

use App\Models\Activity;
use Illuminate\Support\Facades\Auth;

class ActivityLogService
{
    protected $telegram;

    public function __construct(TelegramService $telegram)
    {
        $this->telegram = $telegram;
    }

    /**
     * Log an activity and send notifications.
     */
    public function log(string $type, string $content, ?int $cardId = null): Activity
    {
        $user = Auth::user();
        $userId = $user ? $user->id : null;
        $username = $user ? $user->username : 'System';

        $activity = Activity::create([
            'card_id' => $cardId,
            'user_id' => $userId,
            'type' => $type,
            'content' => $content,
        ]);

        // Send to Telegram (using HTML tags)
        $telegramMsg = "🔔 <b>Activity Log</b>\n\n"
                    . "👤 <b>User:</b> " . htmlspecialchars($username) . "\n"
                    . "📂 <b>Type:</b> " . htmlspecialchars($type) . "\n"
                    . "📝 <b>Content:</b> " . htmlspecialchars($content);
        
        if ($cardId) {
            $card = \App\Models\Card::find($cardId);
            if ($card) {
                $telegramMsg .= "\n📋 <b>Card:</b> " . htmlspecialchars($card->title);
            }
        }

        $this->telegram->sendMessage($telegramMsg);

        return $activity;
    }
}
