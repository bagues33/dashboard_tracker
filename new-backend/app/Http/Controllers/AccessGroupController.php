<?php

namespace App\Http\Controllers;

use App\Models\AccessGroup;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccessGroupController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        return response()->json(AccessGroup::all());
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|unique:access_groups',
            'permissions' => 'required|array',
        ]);

        $group = AccessGroup::create([
            'name' => $request->name,
            'permissions' => $request->permissions,
        ]);

        return back()->with('success', 'Access group created successfully.');
    }

    public function update(Request $request, AccessGroup $accessGroup)
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|unique:access_groups,name,' . $accessGroup->id,
            'permissions' => 'required|array',
        ]);

        $accessGroup->update([
            'name' => $request->name,
            'permissions' => $request->permissions,
        ]);

        return back()->with('success', 'Access group updated successfully.');
    }

    public function destroy(Request $request, AccessGroup $accessGroup)
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        // Check if any board_user is using this group
        if (\DB::table('board_user')->where('access_group_id', $accessGroup->id)->exists()) {
            return back()->withErrors(['error' => 'Cannot delete group that is currently assigned to users.']);
        }

        $accessGroup->delete();

        return back()->with('success', 'Access group deleted successfully.');
    }
}
