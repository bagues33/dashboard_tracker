<?php

namespace App\Http\Controllers;

use App\Models\TelegramSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TelegramSettingController extends Controller
{
    public function index()
    {
        if (auth()->user()->role !== 'admin') {
            abort(403);
        }

        return Inertia::render('TelegramSettings', [
            'settings' => TelegramSetting::first()
        ]);
    }

    public function update(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403);
        }

        $request->validate([
            'bot_token' => 'required|string',
            'chat_id' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $setting = TelegramSetting::firstOrNew();
        $setting->bot_token = trim($request->bot_token);
        $setting->chat_id = trim($request->chat_id);
        $setting->is_active = $request->boolean('is_active');
        $setting->save();

        return back()->with('success', 'Telegram settings updated successfully.');
    }
}
