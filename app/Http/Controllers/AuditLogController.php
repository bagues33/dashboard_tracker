<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\NotificationLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403);
        }

        $activities = Activity::with(['user', 'card'])
            ->latest()
            ->paginate(20, ['*'], 'activities_page');

        $notifications = NotificationLog::with(['user', 'card'])
            ->latest()
            ->paginate(20, ['*'], 'notifications_page');

        return Inertia::render('Logs/Index', [
            'activities' => $activities,
            'notifications' => $notifications
        ]);
    }

    public function destroyActivity(Activity $activity)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403);
        }

        $activity->delete();
        return back()->with('success', 'Activity log removed.');
    }
}
