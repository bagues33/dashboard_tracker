<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\CardList;
use Illuminate\Http\Request;
use App\Traits\ResolvesPermissions;

use App\Services\WhatsappService;
use App\Services\EmailService;

class CardController extends Controller
{
    use ResolvesPermissions;

    protected $whatsappService;
    protected $emailService;
    protected $activityLog;

    public function __construct(WhatsappService $whatsappService, EmailService $emailService, \App\Services\ActivityLogService $activityLog)
    {
        $this->whatsappService = $whatsappService;
        $this->emailService = $emailService;
        $this->activityLog = $activityLog;
    }
    public function store(Request $request, CardList $cardList)
    {
        $this->authorizeProjectAction($request->user(), $cardList->board_id, 'card_create');

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'position' => 'nullable|integer',
            'priority' => 'nullable|string',
            'due_date' => 'nullable|date'
        ]);

        $card = $cardList->cards()->create([
            'title' => $request->title,
            'description' => $request->description,
            'assigned_to' => $request->assigned_to,
            'position' => $request->position ?? $cardList->cards()->count(),
            'priority' => $request->priority ?? 'medium',
            'due_date' => $request->due_date
        ]);

        $this->activityLog->log('Transaction', "Created card: {$card->title}", $card->id);

        if ($card->assigned_to) {
            $user = \App\Models\User::find($card->assigned_to);
            if ($user) {
                $boardName = $cardList->board->name ?? 'Project';
                $dueInfo = $card->due_date ? ' (Due: ' . \Carbon\Carbon::parse($card->due_date)->format('d M Y') . ')' : '';

                // WhatsApp
                if ($user->phone) {
                    $waMsg = "📋 *Task Baru Diterima*\n\nHalo *{$user->username}*, Anda telah di-assign task baru:\n\n"
                        . "*Task:* {$card->title}{$dueInfo}\n*Project:* {$boardName}\n\nSilakan cek aplikasi Tracker untuk detail selengkapnya.";
                    $this->whatsappService->sendMessage($user->phone, $waMsg, $user->id, 'assignment', $card->id, 'task', 'assignment');
                }

                // Email
                if ($user->email) {
                    $subject = "📋 Task Baru: {$card->title}";
                    $html = $this->buildAssignmentEmail($user->username, $card->title, $boardName, $card->due_date);
                    $this->emailService->sendMail($user->email, $subject, $html, $user->id, 'assignment', $card->id, 'task', 'assignment');
                }
            }
        }

        return back();
    }

    public function update(Request $request, Card $card)
    {
        $this->authorizeProjectAction($request->user(), $card->cardList->board_id, 'card_edit');

        $request->validate([
            'card_list_id' => 'required|exists:card_lists,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'position' => 'required|integer',
            'priority' => 'nullable|string',
            'due_date' => 'nullable|date'
        ]);

        $data = $request->all();

        if ($request->has('card_list_id') && $request->card_list_id != $card->card_list_id) {
            $newList = \App\Models\CardList::find($request->card_list_id);
            if ($newList && strtolower(trim($newList->name)) === 're open') {
                $data['reopen_count'] = $card->reopen_count + 1;
            }
        }

        $oldAssignedTo = $card->assigned_to;
        $card->update($data);

        $this->activityLog->log('Transaction', "Updated card: {$card->title}", $card->id);

        if ($card->assigned_to && $card->assigned_to != $oldAssignedTo) {
            $user = \App\Models\User::find($card->assigned_to);
            if ($user) {
                $boardName = $card->cardList->board->name ?? 'Project';
                $dueInfo = $card->due_date ? ' (Due: ' . \Carbon\Carbon::parse($card->due_date)->format('d M Y') . ')' : '';

                // WhatsApp
                if ($user->phone) {
                    $waMsg = "📋 *Task Di-assign*\n\nHalo *{$user->username}*, Anda telah di-assign task:\n\n"
                        . "*Task:* {$card->title}{$dueInfo}\n*Project:* {$boardName}\n\nSilakan cek aplikasi Tracker untuk detail selengkapnya.";
                    $this->whatsappService->sendMessage($user->phone, $waMsg, $user->id, 'reassignment', $card->id, 'task', 'assignment');
                }

                // Email
                if ($user->email) {
                    $subject = "📋 Task Di-assign: {$card->title}";
                    $html = $this->buildAssignmentEmail($user->username, $card->title, $boardName, $card->due_date);
                    $this->emailService->sendMail($user->email, $subject, $html, $user->id, 'reassignment', $card->id, 'task', 'assignment');
                }
            }
        }

        return back();
    }

    /**
     * Build the HTML body for a task assignment email.
     */
    protected function buildAssignmentEmail(string $username, string $taskTitle, string $boardName, ?string $dueDate): string
    {
        $dueLine = $dueDate
            ? '<tr><td style="color:#64748b;font-size:12px;font-weight:600;width:90px;padding:4px 0;">📅 Due Date</td><td style="color:#cbd5e1;font-size:13px;font-weight:600;padding:4px 0;">' . \Carbon\Carbon::parse($dueDate)->format('d M Y') . '</td></tr>'
            : '';

        return <<<HTML
<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"><title>Task Assignment</title></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
        <tr><td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:32px 40px;text-align:center;">
          <div style="font-size:36px;margin-bottom:8px;">📋</div>
          <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;">Task Baru Di-assign</h1>
          <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:13px;">Tracker BPKP — Sistem Manajemen Proyek</p>
        </td></tr>
        <tr><td style="padding:36px 40px;">
          <p style="color:#94a3b8;font-size:14px;margin:0 0 8px;">Halo,</p>
          <p style="color:#f1f5f9;font-size:18px;font-weight:700;margin:0 0 24px;"><strong style="color:#a78bfa;">{$username}</strong> — sebuah task baru telah di-assign kepadamu.</p>
          <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:24px;margin-bottom:24px;">
            <div style="color:#64748b;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;">DETAIL TASK</div>
            <div style="color:#f1f5f9;font-size:16px;font-weight:700;margin-bottom:16px;">{$taskTitle}</div>
            <hr style="border:none;border-top:1px solid #1e293b;margin:12px 0;">
            <table width="100%" cellpadding="0" cellspacing="8">
              <tr><td style="color:#64748b;font-size:12px;font-weight:600;width:90px;padding:4px 0;">📁 Project</td><td style="color:#cbd5e1;font-size:13px;font-weight:600;padding:4px 0;">{$boardName}</td></tr>
              {$dueLine}
            </table>
          </div>
          <p style="color:#64748b;font-size:13px;line-height:1.6;">Buka aplikasi Tracker untuk melihat detail task dan mulai mengerjakannya.</p>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid #1e293b;text-align:center;">
          <p style="color:#475569;font-size:11px;margin:0;">Pesan ini dikirim otomatis oleh <strong style="color:#64748b;">Tracker BPKP</strong>. Jangan balas email ini.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;
    }

    public function destroy(Card $card)
    {
        $this->authorizeProjectAction(request()->user(), $card->cardList->board_id, 'card_delete');

        $title = $card->title;
        $card->delete();

        $this->activityLog->log('Transaction', "Deleted card: {$title}");

        return back();
    }

    public function reorder(Request $request, CardList $cardList)
    {
        $this->authorizeProjectAction($request->user(), $cardList->board_id, 'card_move');

        $request->validate([
            'cards' => 'required|array',
            'cards.*.id' => 'required|exists:cards,id',
            'cards.*.position' => 'required|integer',
        ]);

        $isReopen = strtolower(trim($cardList->name)) === 're open';

        foreach ($request->cards as $item) {
            $card = Card::find($item['id']);
            if (!$card) continue;

            $updateData = [
                'card_list_id' => $cardList->id,
                'position' => $item['position']
            ];

            // Specific reassignment if provided in the item
            if (isset($item['assigned_to'])) {
                $updateData['assigned_to'] = $item['assigned_to'];
            }

            // If moved to "re open" from a different list, increment reopen_count
            if ($isReopen && $card->card_list_id != $cardList->id) {
                $updateData['reopen_count'] = $card->reopen_count + 1;
            }

            $card->update($updateData);
        }

        return back();
    }
}
