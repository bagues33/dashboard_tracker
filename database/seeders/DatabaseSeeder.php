<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Default Admin User
        User::updateOrCreate(
            ['username' => 'admin'],
            [
                'email' => 'admin@admin.com',
                'password' => bcrypt('password'),
                'role' => 'admin',
            ]
        );

        // Default Permissions
        $permissions = [
            // Admin Permissions
            ['role' => 'admin', 'permission_key' => 'manage_users', 'is_enabled' => true],
            ['role' => 'admin', 'permission_key' => 'manage_boards', 'is_enabled' => true],
            ['role' => 'admin', 'permission_key' => 'view_analytics', 'is_enabled' => true],
            ['role' => 'admin', 'permission_key' => 'import_data', 'is_enabled' => true],
            
            // User Permissions
            ['role' => 'user', 'permission_key' => 'manage_users', 'is_enabled' => false],
            ['role' => 'user', 'permission_key' => 'manage_boards', 'is_enabled' => true],
            ['role' => 'user', 'permission_key' => 'view_analytics', 'is_enabled' => false],
            ['role' => 'user', 'permission_key' => 'import_data', 'is_enabled' => false],
        ];

        foreach ($permissions as $permission) {
            \App\Models\Permission::updateOrCreate(
                [
                    'role' => $permission['role'],
                    'permission_key' => $permission['permission_key'],
                ],
                [
                    'is_enabled' => $permission['is_enabled'],
                ]
            );
        }
    }
}
