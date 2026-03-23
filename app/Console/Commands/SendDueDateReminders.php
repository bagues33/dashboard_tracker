<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Card;
use App\Services\WhatsappService;
use App\Services\EmailService;
use Carbon\Carbon;

class SendDueDateReminders extends Command
{
    protected $signature = 'whatsapp:send-reminders';
    protected $description = 'Send WhatsApp & email reminders for tasks with upcoming or overdue due dates';

    public function handle(WhatsappService $whatsapp, EmailService $email)
    {
        $todayStr = Carbon::today()->format('Y-m-d');
        
        $scheduledLogs = \App\Models\NotificationLog::with(['user', 'card.cardList.board'])
            ->where('status', 'scheduled')
            ->whereDate('scheduled_at', '<=', $todayStr)
            ->get();

        if ($scheduledLogs->isEmpty()) {
            $this->info("No scheduled reminders to send today.");
            return 0;
        }

        $sent = 0;
        $failed = 0;

        foreach ($scheduledLogs as $log) {
            $card = $log->card;
            if (!$card) {
                $log->delete();
                continue;
            }

            // Double check if card is still relevant (not Done)
            if (strtolower($card->cardList->name ?? '') === 'done') {
                $log->delete();
                continue;
            }

            $user = $log->user;
            $success = false;

            if ($log->type === 'whatsapp') {
                $success = $whatsapp->sendMessage($log->recipient, $log->content, $user->id, $log->context, $card->id, $log->task_type, $log->purpose);
            } elseif ($log->type === 'email') {
                $dueDateFormatted = Carbon::parse($card->due_date)->format('d M Y');
                $boardName = $card->cardList->board->name ?? 'Project';
                $diffDays = Carbon::today()->diffInDays(Carbon::parse($card->due_date)->startOfDay(), false);
                
                $labels = $this->calculateLabels($diffDays);
                
                $htmlBody = $this->buildEmailBody(
                    $user->username,
                    $card->title,
                    $boardName,
                    $dueDateFormatted,
                    $labels['timeLabel'],
                    $labels['badgeColor'],
                    $labels['badgeLabel'],
                    $labels['emoji']
                );

                $success = $email->sendMail($log->recipient, $log->subject, $htmlBody, $user->id, $log->context, $card->id, $log->task_type, $log->purpose);
            }

            if ($success) {
                $log->delete();
                $sent++;
            } else {
                $log->delete();
                $failed++;
            }
        }

        $this->info("Done. {$sent} reminder(s) sent, {$failed} failed.");
        return 0;
    }

    protected function calculateLabels(int $diffDays): array
    {
        if ($diffDays === 2) {
            return ['timeLabel' => '2 hari lagi', 'emoji' => '⏰', 'badgeColor' => '#f59e0b', 'badgeLabel' => 'Upcoming'];
        } elseif ($diffDays === 0) {
            return ['timeLabel' => 'HARI INI', 'emoji' => '🚨', 'badgeColor' => '#ef4444', 'badgeLabel' => 'Due Today'];
        } else {
            $days = abs($diffDays);
            return ['timeLabel' => "{$days} hari yang lalu (overdue)", 'emoji' => '🔴', 'badgeColor' => '#dc2626', 'badgeLabel' => "Overdue {$days}d"];
        }
    }

    protected function buildEmailBody(
        string $username,
        string $taskTitle,
        string $boardName,
        string $dueDate,
        string $timeLabel,
        string $badgeColor,
        string $badgeLabel,
        string $emoji
    ): string {
        return <<<HTML
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Task Reminder</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:32px 40px;text-align:center;">
              <div style="font-size:36px;margin-bottom:8px;">{$emoji}</div>
              <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;">Task Reminder</h1>
              <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:13px;font-weight:500;">Tracker BPKP — Sistem Manajemen Proyek</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="color:#94a3b8;font-size:14px;margin:0 0 8px;">Halo,</p>
              <p style="color:#f1f5f9;font-size:18px;font-weight:700;margin:0 0 24px;"><strong style="color:#a78bfa;">{$username}</strong> — task berikut memerlukan perhatianmu segera.</p>
              
              <!-- Task Card -->
              <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:24px;margin-bottom:24px;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
                  <div>
                    <div style="color:#64748b;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">NAMA TASK</div>
                    <div style="color:#f1f5f9;font-size:16px;font-weight:700;">{$taskTitle}</div>
                  </div>
                  <span style="background:{$badgeColor}22;color:{$badgeColor};font-size:11px;font-weight:800;padding:4px 12px;border-radius:20px;border:1px solid {$badgeColor}44;white-space:nowrap;">{$badgeLabel}</span>
                </div>
                
                <hr style="border:none;border-top:1px solid #1e293b;margin:16px 0;">
                
                <table width="100%" cellpadding="0" cellspacing="8">
                  <tr>
                    <td style="color:#64748b;font-size:12px;font-weight:600;width:90px;padding:4px 0;">📁 Project</td>
                    <td style="color:#cbd5e1;font-size:13px;font-weight:600;padding:4px 0;">{$boardName}</td>
                  </tr>
                  <tr>
                    <td style="color:#64748b;font-size:12px;font-weight:600;padding:4px 0;">📅 Due Date</td>
                    <td style="color:#cbd5e1;font-size:13px;font-weight:600;padding:4px 0;">{$dueDate} <span style="color:{$badgeColor};font-size:11px;">({$timeLabel})</span></td>
                  </tr>
                </table>
              </div>

              <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0 0 24px;">
                Segera selesaikan task ini dan perbarui statusnya menjadi <strong style="color:#10b981;">Done</strong>. Reminder otomatis akan berhenti setelah status diperbarui.
              </p>

              <a href="#" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:13px;font-weight:700;padding:12px 28px;border-radius:10px;text-decoration:none;letter-spacing:0.5px;">
                Buka Aplikasi Tracker →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #1e293b;text-align:center;">
              <p style="color:#475569;font-size:11px;margin:0;">Pesan ini dikirim otomatis oleh <strong style="color:#64748b;">Tracker BPKP</strong>. Jangan balas email ini.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;
    }
}
