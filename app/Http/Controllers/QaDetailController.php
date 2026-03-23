<?php

namespace App\Http\Controllers;

use App\Models\Checklist;
use App\Models\QaDetail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Traits\ResolvesPermissions;

class QaDetailController extends Controller
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

    public function store(Request $request, Checklist $checklist)
    {
        $this->authorizeProjectAction($request->user(), $checklist->card->cardList->board_id, 'qa_manage');

        $request->validate([
            'title' => 'required|string|max:255',
            'status' => 'nullable|string|in:to do,in progress,done dev,re open,done',
            'priority' => 'nullable|string|in:low,medium,high,urgent',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $qaDetail = $checklist->qaDetails()->create([
            'title' => $request->title,
            'status' => $request->status ?? 'to do',
            'priority' => $request->priority ?? 'medium',
            'assigned_to' => $request->assigned_to,
            'position' => $checklist->qaDetails()->count(),
        ]);

        $this->activityLog->log('Transaction', "Created QA detail: {$qaDetail->title}", $checklist->card_id);

        $this->notifyOnCreation($qaDetail);

        return back();
    }

    protected function notifyOnCreation(QaDetail $qaDetail)
    {
        // 1. If specifically assigned, notify the assignee
        if ($qaDetail->assigned_to) {
            $this->notifyAssignee($qaDetail);
            return;
        }

        // 2. If not specifically assigned, notify the parent Checklist assignee
        $parentAssignee = $qaDetail->checklist->assignee;
        if ($parentAssignee) {
            $this->notifyParentAssignee($qaDetail, $parentAssignee);
        }
    }

    protected function notifyParentAssignee(QaDetail $qaDetail, \App\Models\User $user)
    {
        $checklist = $qaDetail->checklist;
        $card = $checklist->card;
        $boardName = $card->cardList->board->name ?? 'Project';
        
        // WA Notification
        if ($user->phone) {
            $msg = "📢 *New Detail Added to Your Subtask*\n\n"
                 . "Halo *{$user->username}*,\n"
                 . "Ada detail QA baru pada subtask yang kamu kerjakan:\n\n"
                 . "🔸 *Detail:* {$qaDetail->title}\n"
                 . "🔹 *Subtask:* {$checklist->content}\n"
                 . "📋 *Main Task:* {$card->title}\n\n"
                 . "Silakan cek dashboard.";
            
            $this->whatsapp->sendMessage($user->phone, $msg, $user->id, 'qa_addition', $card->id, 'detail', 'addition');
        }

        // Email Notification
        if ($user->email) {
            $subject = "📢 New Detail Added to: {$checklist->content}";
            $body = "<h2>Hello {$user->username}</h2>"
                  . "<p>A new QA detail has been added to your subtask:</p>"
                  . "<ul>"
                  . "<li><strong>Detail:</strong> {$qaDetail->title}</li>"
                  . "<li><strong>Subtask:</strong> {$checklist->content}</li>"
                  . "<li><strong>Main Task:</strong> {$card->title}</li>"
                  . "</ul>";
            
            $this->email->sendMail($user->email, $subject, $body, $user->id, 'qa_addition', $card->id, 'detail', 'addition');
        }
    }

    public function show(QaDetail $qaDetail)
    {
        $this->authorizeProjectAction(auth()->user(), $qaDetail->checklist->card->cardList->board_id, 'project_view');

        return Inertia::render('QaDetail/Show', [
            'qaDetail' => $qaDetail->load(['checklist.card.cardList.board', 'assignee']),
            'users' => \App\Models\User::all(),
        ]);
    }

    public function update(Request $request, QaDetail $qaDetail)
    {
        $this->authorizeProjectAction($request->user(), $qaDetail->checklist->card->cardList->board_id, 'qa_manage');

        $request->validate([
            'title' => 'nullable|string',
            'status' => 'nullable|string|in:to do,in progress,done dev,re open,done',
            'priority' => 'nullable|string|in:low,medium,high,urgent',
            'assigned_to' => 'nullable|exists:users,id',
            'expected_result' => 'nullable|string',
            'steps_to_reproduce' => 'nullable|string',
            'image_url' => 'nullable|string|max:1000',
            'error_url' => 'nullable|string|max:1000',
        ]);

        $oldAssigneeId = $qaDetail->assigned_to;
        $data = $request->only(['title', 'status', 'priority', 'assigned_to', 'expected_result', 'steps_to_reproduce', 'image_url', 'error_url']);
        $qaDetail->update($data);

        $this->activityLog->log('Transaction', "Updated QA detail: {$qaDetail->title}", $qaDetail->checklist->card_id);

        if ($qaDetail->assigned_to && $qaDetail->assigned_to != $oldAssigneeId) {
            $this->notifyAssignee($qaDetail);
        }

        return back();
    }

    protected function notifyAssignee(QaDetail $qaDetail)
    {
        $user = $qaDetail->assignee;
        if (!$user) return;

        $checklist = $qaDetail->checklist;
        $card = $checklist->card;
        $boardName = $card->cardList->board->name ?? 'Project';
        
        // WA Notification
        if ($user->phone) {
            $msg = "📢 *QA Detail Assigned*\n\n"
                 . "Halo *{$user->username}*,\n"
                 . "Kamu telah ditugaskan pada detail QA baru:\n\n"
                 . "🔸 *Detail:* {$qaDetail->title}\n"
                 . "🔹 *Subtask:* {$checklist->content}\n"
                 . "📋 *Main Task:* {$card->title}\n"
                 . "📁 *Project:* {$boardName}\n\n"
                 . "Silakan cek dashboard untuk detailnya.";
            
            $this->whatsapp->sendMessage($user->phone, $msg, $user->id, 'qa_assignment', $card->id, 'detail', 'assignment');
        }

        // Email Notification
        if ($user->email) {
            $subject = "📢 New QA Detail Assigned: {$qaDetail->title}";
            $body = "<h2>Hello {$user->username}</h2>"
                  . "<p>You have been assigned to a new QA detail:</p>"
                  . "<ul>"
                  . "<li><strong>Detail:</strong> {$qaDetail->title}</li>"
                  . "<li><strong>Subtask:</strong> {$checklist->content}</li>"
                  . "<li><strong>Main Task:</strong> {$card->title}</li>"
                  . "<li><strong>Project:</strong> {$boardName}</li>"
                  . "</ul>"
                  . "<p>Please log in to your dashboard to view more details.</p>";
            
            $this->email->sendMail($user->email, $subject, $body, $user->id, 'qa_assignment', $card->id, 'detail', 'assignment');
        }
    }

    public function move(Request $request, QaDetail $qaDetail)
    {
        $this->authorizeProjectAction($request->user(), $qaDetail->checklist->card->cardList->board_id, 'qa_manage');

        $request->validate([
            'checklist_id' => 'required|exists:checklists,id',
            'assigned_to' => 'required|exists:users,id',
        ]);

        $qaDetail->update([
            'checklist_id' => $request->checklist_id,
            'assigned_to' => $request->assigned_to,
            'position' => \App\Models\Checklist::find($request->checklist_id)->qaDetails()->count(),
        ]);

        return redirect()->route('checklists.show', $request->checklist_id);
    }

    public function destroy(QaDetail $qaDetail)
    {
        $this->authorizeProjectAction(request()->user(), $qaDetail->checklist->card->cardList->board_id, 'qa_manage');

        $title = $qaDetail->title;
        $cardId = $qaDetail->checklist->card_id;
        $qaDetail->delete();

        $this->activityLog->log('Transaction', "Deleted QA detail: {$title}", $cardId);

        return back();
    }
}
