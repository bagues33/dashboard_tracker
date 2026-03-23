<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\Checklist;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Traits\ResolvesPermissions;

class ChecklistController extends Controller
{
    use ResolvesPermissions;

    protected $whatsapp;
    protected $email;
    protected $activityLog;

    public function __construct(\App\Services\WhatsappService $whatsapp, \App\Services\EmailService $email, \App\Services\ActivityLogService $activityLog)
    {
        $this->whatsapp = $whatsapp;
        $this->email = $email;
        $this->activityLog = $activityLog;
    }

    public function show(Checklist $checklist)
    {
        $this->authorizeProjectAction(auth()->user(), $checklist->card->cardList->board_id, 'project_view');

        return Inertia::render('Checklist/Show', [
            'checklist' => $checklist->load(['card.cardList.board', 'qaDetails.assignee']),
            'users' => \App\Models\User::all(),
        ]);
    }

    public function store(Request $request, Card $card)
    {
        $this->authorizeProjectAction($request->user(), $card->cardList->board_id, 'subtask_manage');

        $request->validate([
            'content' => 'required|string|max:255',
            'status' => 'nullable|string|in:to do,in progress,re open,done',
            'priority' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id'
        ]);

        $checklist = $card->checklists()->create([
            'content' => $request->content,
            'status' => $request->status ?? 'to do',
            'is_completed' => ($request->status === 'done'),
            'priority' => $request->priority ?? 'medium',
            'assigned_to' => $request->assigned_to,
            'position' => $card->checklists()->count()
        ]);

        $this->activityLog->log('Transaction', "Created subtask: {$checklist->content}", $card->id);

        if ($checklist->assigned_to) {
            $this->notifyAssignee($checklist);
        }

        return back();
    }

    public function update(Request $request, Checklist $checklist)
    {
        $this->authorizeProjectAction($request->user(), $checklist->card->cardList->board_id, 'subtask_manage');

        $request->validate([
            'content' => 'nullable|string',
            'status' => 'nullable|string|in:to do,in progress,re open,done',
            'priority' => 'nullable|string',
            'expected_result' => 'nullable|string',
            'steps_to_reproduce' => 'nullable|string',
            'image_url' => 'nullable|string|max:1000',
            'error_url' => 'nullable|string|max:1000',
            'assigned_to' => 'nullable|exists:users,id'
        ]);

        $oldAssigneeId = $checklist->assigned_to;
        $data = $request->only(['content', 'status', 'priority', 'expected_result', 'steps_to_reproduce', 'image_url', 'error_url', 'assigned_to']);

        if ($request->has('status')) {
            $data['is_completed'] = ($request->status === 'done');
        }

        $checklist->update($data);

        $this->activityLog->log('Transaction', "Updated subtask: {$checklist->content}", $checklist->card_id);

        if ($checklist->assigned_to && $checklist->assigned_to != $oldAssigneeId) {
            $this->notifyAssignee($checklist);
        }

        return back();
    }

    protected function notifyAssignee(Checklist $checklist)
    {
        $user = $checklist->assignee;
        if (!$user) return;

        $card = $checklist->card;
        $boardName = $card->cardList->board->name ?? 'Project';
        
        // WA Notification
        if ($user->phone) {
            $msg = "📢 *Subtask Assigned*\n\n"
                 . "Halo *{$user->username}*,\n"
                 . "Kamu telah ditugaskan pada subtask baru:\n\n"
                 . "🔹 *Subtask:* {$checklist->content}\n"
                 . "📋 *Main Task:* {$card->title}\n"
                 . "📁 *Project:* {$boardName}\n\n"
                 . "Silakan cek dashboard untuk detailnya.";
            
            $this->whatsapp->sendMessage($user->phone, $msg, $user->id, 'subtask_assignment', $card->id, 'subtask', 'assignment');
        }

        // Email Notification
        if ($user->email) {
            $subject = "📢 New Subtask Assigned: {$checklist->content}";
            $body = "<h2>Hello {$user->username}</h2>"
                  . "<p>You have been assigned to a new subtask:</p>"
                  . "<ul>"
                  . "<li><strong>Subtask:</strong> {$checklist->content}</li>"
                  . "<li><strong>Main Task:</strong> {$card->title}</li>"
                  . "<li><strong>Project:</strong> {$boardName}</li>"
                  . "</ul>"
                  . "<p>Please log in to your dashboard to view more details.</p>";
            
            $this->email->sendMail($user->email, $subject, $body, $user->id, 'subtask_assignment', $card->id, 'subtask', 'assignment');
        }
    }

    public function move(Request $request, Checklist $checklist)
    {
        $this->authorizeProjectAction($request->user(), $checklist->card->cardList->board_id, 'subtask_manage');

        $request->validate([
            'card_id' => 'required|exists:cards,id',
            'assigned_to' => 'required|exists:users,id',
        ]);

        $checklist->update([
            'card_id' => $request->card_id,
            'assigned_to' => $request->assigned_to,
            'position' => \App\Models\Card::find($request->card_id)->checklists()->count(),
        ]);

        return redirect()->route('boards.show', $checklist->card->card_list->board_id);
    }

    public function destroy(Checklist $checklist)
    {
        $this->authorizeProjectAction(request()->user(), $checklist->card->cardList->board_id, 'subtask_manage');

        $content = $checklist->content;
        $cardId = $checklist->card_id;
        $checklist->delete();

        $this->activityLog->log('Transaction', "Deleted subtask: {$content}", $cardId);

        return back();
    }
}
