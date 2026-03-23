<?php

namespace App\Http\Controllers;

use App\Models\WhatsappSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;

class WhatsappSettingController extends Controller
{
    public function index()
    {
        if (auth()->user()->role !== 'admin') {
            abort(403);
        }

        return Inertia::render('WhatsappSettings', [
            'settings' => WhatsappSetting::first()
        ]);
    }

    public function update(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403);
        }

        $request->validate([
            'api_url' => 'required|url',
            'api_token' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $setting = WhatsappSetting::firstOrNew();
        $setting->fill($request->all());
        $setting->save();

        return back()->with('success', 'WhatsApp settings updated successfully.');
    }

    public function sendReminders(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403);
        }

        Artisan::call('whatsapp:send-reminders');
        $output = Artisan::output();

        // Count sent from the last line (e.g. "Done. 3 reminder(s) sent.")
        preg_match('/(\d+) reminder/', $output, $matches);
        $count = $matches[1] ?? 0;

        return response()->json([
            'message' => "Berhasil mengirim {$count} reminder ke pengguna yang memiliki task mendekati/melewati due date.",
            'count' => (int) $count,
            'output' => trim($output),
        ]);
    }
}
