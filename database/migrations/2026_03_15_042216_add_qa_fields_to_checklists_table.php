<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('checklists', function (Blueprint $table) {
            $table->text('expected_result')->nullable();
            $table->text('steps_to_reproduce')->nullable();
            $table->string('image_url')->nullable();
            $table->string('error_url')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('checklists', function (Blueprint $table) {
            $table->dropColumn(['expected_result', 'steps_to_reproduce', 'image_url', 'error_url']);
        });
    }
};
