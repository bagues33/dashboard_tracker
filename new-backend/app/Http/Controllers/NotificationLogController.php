<?php

namespace App\Http\Controllers;

use App\Models\NotificationLog;
use App\Services\WhatsappService;
use App\Services\EmailService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationLogController extends Controller
{
    protected $whatsapp;
    protected $email;

    public function __construct(WhatsappService $whatsapp, EmailService $email)
    {
        $this->whatsapp = $whatsapp;
        $this->email = $email;
    }

    public function index(Request $request)
    {
        $logs = NotificationLog::with(['user', 'card'])
            ->latest()
            ->paginate(20);

        if ($request->wantsJson() || $request->header('X-Inertia')) {
            return response()->json($logs);
        }

        return Inertia::render('UserManagement', [
            'logs' => $logs
        ]);
    }

    public function resend(NotificationLog $log)
    {
        $success = false;

        if ($log->type === 'whatsapp') {
            $success = $this->whatsapp->sendMessage(
                $log->recipient,
                $log->content,
                $log->user_id,
                $log->context . '_resend',
                $log->card_id,
                $log->task_type,
                $log->purpose
            );
        } elseif ($log->type === 'email') {
            $success = $this->email->sendMail(
                $log->recipient,
                $log->subject ?? 'Notification Resend',
                $log->content,
                $log->user_id,
                $log->context . '_resend',
                $log->card_id,
                $log->task_type,
                $log->purpose
            );
        }

        if ($success) {
            // If it was a scheduled notification being sent prematurely ("Send Now"), delete the scheduled log
            if ($log->status === 'scheduled') {
                $log->delete();
            }

            return response()->json([
                'success' => true,
                'message' => 'Notification sent successfully'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Failed to resend notification'
        ], 500);
    }
}
