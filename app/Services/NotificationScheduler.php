<?php

namespace App\Services;

use App\Models\Card;
use App\Models\NotificationLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class NotificationScheduler
{
    /**
     * Sync scheduled reminders for a specific card.
     * This will remove existing scheduled reminders and recreate them based on current card state.
     */
    public function syncScheduledReminders(Card $card)
    {
        // 1. Remove existing scheduled reminders for this card
        NotificationLog::where('card_id', $card->id)
            ->where('status', 'scheduled')
            ->delete();

        // 2. If card is DONE or doesn't have a due date, we don't need reminders
        $isDone = strtolower($card->cardList->name ?? '') === 'done';
        if ($isDone || !$card->due_date || !$card->user_id) {
            return;
        }

        $today = Carbon::today();
        $dueDate = Carbon::parse($card->due_date)->startOfDay();
        
        // Reminder intervals: H-2, H, H+1, H+2, H+3
        $offsets = [2, 0, -1, -2, -3];
        
        foreach ($offsets as $offset) {
            $scheduledDate = $dueDate->copy()->subDays($offset);
            
            // Only schedule for future dates (including today if it hasn't passed yet in the scheduler's logic context)
            if ($scheduledDate->greaterThanOrEqualTo($today)) {
                $this->createScheduledLog($card, $scheduledDate, $offset);
            }
        }
    }

    protected function createScheduledLog(Card $card, Carbon $date, int $offset)
    {
        $daysLabel = $this->getDaysLabel($offset);
        $context = "reminder_{$offset}d";
        
        // WhatsApp
        NotificationLog::create([
            'user_id' => $card->user_id,
            'type' => 'whatsapp',
            'recipient' => $card->assignee->phone ?? '-',
            'content' => $this->buildWaMessage($card, $date, $daysLabel),
            'status' => 'scheduled',
            'scheduled_at' => $date->format('Y-m-d 08:00:00'), // Default to 8 AM
            'context' => $context,
            'card_id' => $card->id,
            'task_type' => 'task',
            'purpose' => 'reminder',
        ]);

        // Email
        NotificationLog::create([
            'user_id' => $card->user_id,
            'type' => 'email',
            'recipient' => $card->assignee->email ?? '-',
            'subject' => "⏰ Reminder Task: {$card->title}",
            'content' => 'Email content will be generated at send time', // We can store placeholders or full HTML
            'status' => 'scheduled',
            'scheduled_at' => $date->format('Y-m-d 08:00:00'),
            'context' => $context,
            'card_id' => $card->id,
            'task_type' => 'task',
            'purpose' => 'reminder',
        ]);
    }

    protected function getDaysLabel(int $offset): string
    {
        if ($offset === 2) return "2 hari lagi";
        if ($offset === 0) return "HARI INI";
        $days = abs($offset);
        return "{$days} hari yang lalu (overdue)";
    }

    protected function buildWaMessage(Card $card, Carbon $date, string $timeLabel): string
    {
        $emoji = $timeLabel === 'HARI INI' ? '🚨' : ($date->isPast() ? '🔴' : '⏰');
        $dueDateFormatted = Carbon::parse($card->due_date)->format('d M Y');
        $boardName = $card->cardList->board->name ?? 'Project';

        return "{$emoji} *Scheduled Reminder Task*\n\n"
            . "Halo *{$card->assignee->username}*,\n\n"
            . "Task berikut dijadwalkan untuk diingatkan:\n\n"
            . "📋 *Task:* {$card->title}\n"
            . "📁 *Project:* {$boardName}\n"
            . "📅 *Due Date:* {$dueDateFormatted} ({$timeLabel})\n\n"
            . "_Pesan ini dijadwalkan otomatis oleh sistem Tracker BPKP._";
    }
}
