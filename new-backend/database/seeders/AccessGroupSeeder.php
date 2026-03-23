<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AccessGroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $allPermissions = [
            'project_view' => true,
            'project_edit' => true,
            'project_delete' => true,
            'section_manage' => true,
            'card_create' => true,
            'card_edit' => true,
            'card_delete' => true,
            'card_move' => true,
            'subtask_manage' => true,
            'qa_manage' => true,
            'data_import' => true,
            'analytics_view' => true,
        ];

        $groups = [
            [
                'name' => 'Administrator',
                'permissions' => $allPermissions,
            ],
            [
                'name' => 'Project Lead',
                'permissions' => array_merge($allPermissions, [
                    'project_delete' => false,
                ]),
            ],
            [
                'name' => 'Team Member',
                'permissions' => [
                    'project_view' => true,
                    'project_edit' => false,
                    'project_delete' => false,
                    'section_manage' => false,
                    'card_create' => true,
                    'card_edit' => true,
                    'card_delete' => false,
                    'card_move' => true,
                    'subtask_manage' => true,
                    'qa_manage' => true,
                    'data_import' => false,
                    'analytics_view' => true,
                ],
            ],
            [
                'name' => 'Client / Viewer',
                'permissions' => [
                    'project_view' => true,
                    'project_edit' => false,
                    'project_delete' => false,
                    'section_manage' => false,
                    'card_create' => false,
                    'card_edit' => false,
                    'card_delete' => false,
                    'card_move' => false,
                    'subtask_manage' => false,
                    'qa_manage' => false,
                    'data_import' => false,
                    'analytics_view' => true,
                ],
            ],
        ];

        foreach ($groups as $group) {
            \App\Models\AccessGroup::updateOrCreate(
                ['name' => $group['name']],
                ['permissions' => $group['permissions']]
            );
        }
    }
}
