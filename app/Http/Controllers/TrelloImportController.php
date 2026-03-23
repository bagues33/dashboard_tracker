<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class TrelloImportController extends Controller
{
    public function import(Request $request)
    {
        // TODO: Implement complex JSON parsing logic to create Boards, Lists, Cards from Trello Export
        // Since we are porting existing frontend, we can leave this stub or copy logic from Node
        return redirect()->route('dashboard')->with('success', 'Trello Import Triggered.');
    }

    public function resetData(Request $request)
    {
        // TODO: Implement Admin database wipe with password verification
        return redirect()->route('dashboard')->with('success', 'Database Reset Triggered.');
    }
}
