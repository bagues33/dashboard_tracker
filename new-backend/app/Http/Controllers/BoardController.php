<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\CardList;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Traits\ResolvesPermissions;

class BoardController extends Controller
{
    use ResolvesPermissions;
    protected $activityLog;

    public function __construct(\App\Services\ActivityLogService $activityLog)
    {
        $this->activityLog = $activityLog;
    }
    public function index(Request $request)
    {
        $user = $request->user();
        $isAdmin = $user->role === 'admin';
        
        $boards = $isAdmin 
            ? Board::orderBy('created_at', 'desc')->get()
            : $user->assignedBoards()->wherePivot('can_view', true)->orderBy('created_at', 'desc')->get();

        return Inertia::render('Board/Index', [
            'boards' => $boards
        ]);
    }

    public function show(Request $request, Board $board)
    {
        $permissions = $this->getPermissions($request->user(), $board->id);
        
        if (!($permissions['project_view'] ?? false)) {
            abort(403, 'You do not have permission to view this project.');
        }

        $board->load(['cardLists' => function ($query) {
            $query->orderBy('position');
        }, 'cardLists.cards' => function ($query) {
            $query->orderBy('position');
        }, 'cardLists.cards.assignee', 'cardLists.cards.labels', 'cardLists.cards.checklists', 'cardLists.cards.checklists.qaDetails']);

        return Inertia::render('Board/Show', [
            'board' => $board,
            'users' => \App\Models\User::all(),
            'permissions' => $permissions
        ]);
    }

    public function update(Request $request, Board $board)
    {
        $this->authorizeProjectAction($request->user(), $board->id, 'project_edit');

        $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
        ]);

        $board->update($request->only(['name', 'description']));

        $this->activityLog->log('Transaction', "Updated project: {$board->name}");

        return back();
    }

    public function store(Request $request)
    {
        // Global permission check for creating projects
        // We'll use the existing Permission model or 'admin/manager' roles
        if (!in_array($request->user()->role, ['admin', 'manager'])) {
            abort(403, 'Only admins and managers can create projects.');
        }

        $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
        ]);

        $board = Board::create([
            'name' => $request->name,
            'description' => $request->description,
            'owner_id' => Auth::id(),
        ]);

        $steps = ['todo', 'inprogress', 'ready to test', 're open', 'done'];
        foreach ($steps as $index => $step) {
            CardList::create([
                'board_id' => $board->id,
                'name' => $step,
                'position' => $index,
            ]);
        }

        $this->activityLog->log('Transaction', "Created project: {$board->name}");

        return redirect()->route('boards.show', $board);
    }

    public function destroy(Request $request, Board $board)
    {
        $this->authorizeProjectAction($request->user(), $board->id, 'project_delete');

        $name = $board->name;
        $board->delete();

        $this->activityLog->log('Transaction', "Deleted project: {$name}");
        
        return redirect()->route('dashboard');
    }
}
