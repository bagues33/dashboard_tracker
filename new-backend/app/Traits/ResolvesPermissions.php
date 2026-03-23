<?php

namespace App\Traits;

use App\Models\Board;
use App\Models\AccessGroup;

trait ResolvesPermissions
{
    /**
     * Resolve permissions for a user on a specific board.
     */
    protected function getPermissions($user, $boardId)
    {
        if ($user->role === 'admin') {
            return array_fill_keys([
                'project_view', 'project_edit', 'project_delete', 
                'section_manage', 'card_create', 'card_edit', 
                'card_delete', 'card_move', 'subtask_manage', 
                'qa_manage', 'data_import', 'analytics_view'
            ], true);
        }

        $pivot = \DB::table('board_user')
            ->where('user_id', $user->id)
            ->where('board_id', $boardId)
            ->first();

        if (!$pivot) {
            return [];
        }

        $basePermissions = [
            'project_view' => (bool)$pivot->can_view,
            'card_create' => (bool)$pivot->can_create,
            'card_edit' => (bool)$pivot->can_edit,
            'card_delete' => (bool)$pivot->can_delete,
        ];

        if ($pivot->access_group_id) {
            $group = AccessGroup::find($pivot->access_group_id);
            if ($group) {
                $groupPermissions = $group->permissions;
                // Merge, with group permissions potentially overriding base or filling gaps
                $resolved = array_merge($basePermissions, $groupPermissions);
                
                // Ensure legacy 'can_...' flags are consistent with granular if they were missing
                $resolved['project_view'] = $resolved['project_view'] || ($resolved['can_view'] ?? false);
                
                return $resolved;
            }
        }

        return $basePermissions;
    }

    protected function authorizeProjectAction($user, $boardId, $permission)
    {
        $permissions = $this->getPermissions($user, $boardId);
        if (!($permissions[$permission] ?? false)) {
            abort(403, "Unauthorized: Missing {$permission} permission.");
        }
    }
}
