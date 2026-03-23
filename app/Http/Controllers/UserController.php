<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Board;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use App\Models\Permission;

class UserController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Unauthorized access to user management.');
        }

        return Inertia::render('UserManagement', [
            'users' => User::with('assignedBoards')->orderBy('created_at', 'desc')->get(),
            'boards' => \App\Models\Board::all(),
            'permissions' => \App\Models\Permission::all(),
            'accessGroups' => \App\Models\AccessGroup::all(),
            'whatsappSettings' => \App\Models\WhatsappSetting::first(),
        ]);
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        $request->validate([
            'username' => 'required|string|unique:users',
            'email' => 'required|email|unique:users',
            'phone' => 'nullable|string',
            'password' => 'required|string',
            'role' => 'required|string',
        ]);

        User::create([
            'username' => $request->username,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        return back();
    }

    public function update(Request $request, User $user)
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        $request->validate([
            'username' => 'required|string|unique:users,username,' . $user->id,
            'email' => 'required|email|unique:users,email,' . $user->id,
            'role' => 'required|string',
            'phone' => 'nullable|string',
            'password' => 'nullable|string|min:8',
        ]);

        $data = [
            'username' => $request->username,
            'email' => $request->email,
            'role' => $request->role,
            'phone' => $request->phone,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return back();
    }

    public function destroy(Request $request, User $user)
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        $user->delete();
        return back();
    }

    public function updateProjectPermission(Request $request)
    {
        if (!in_array($request->user()->role, ['admin', 'manager'])) {
            abort(403);
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'board_id' => 'required|exists:boards,id',
            'permission_key' => 'nullable|string',
            'is_enabled' => 'nullable|boolean',
            'access_group_id' => 'nullable|exists:access_groups,id',
        ]);

        $user = User::findOrFail($request->user_id);
        
        // Ensure the pivot record exists or update it
        $pivotData = $user->assignedBoards()->where('board_id', $request->board_id)->first()?->pivot;
        
        $permissions = [
            'access_group_id' => $request->access_group_id !== null ? $request->access_group_id : ($pivotData?->access_group_id ?? null),
            'can_view' => $pivotData?->can_view ?? false,
            'can_create' => $pivotData?->can_create ?? false,
            'can_edit' => $pivotData?->can_edit ?? false,
            'can_delete' => $pivotData?->can_delete ?? false,
        ];

        if ($request->filled('permission_key')) {
            $permissions[$request->permission_key] = $request->is_enabled;
        }

        $user->assignedBoards()->syncWithoutDetaching([
            $request->board_id => $permissions
        ]);

        return back();
    }

    public function updatePermission(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        $request->validate([
            'role' => 'required|string',
            'permission_key' => 'required|string',
            'is_enabled' => 'required|boolean',
        ]);

        Permission::updateOrCreate(
            ['role' => $request->role, 'permission_key' => $request->permission_key],
            ['is_enabled' => $request->is_enabled]
        );

        return back();
    }
}
