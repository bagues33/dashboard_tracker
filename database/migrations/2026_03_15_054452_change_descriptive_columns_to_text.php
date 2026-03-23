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
        Schema::table('cards', function (Blueprint $table) {
            $table->text('title')->change();
        });

        Schema::table('checklists', function (Blueprint $table) {
            $table->text('content')->change();
        });

        Schema::table('qa_details', function (Blueprint $table) {
            $table->text('title')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cards', function (Blueprint $table) {
            $table->string('title', 255)->change();
        });

        Schema::table('checklists', function (Blueprint $table) {
            $table->string('content', 255)->change();
        });

        Schema::table('qa_details', function (Blueprint $table) {
            $table->string('title', 255)->change();
        });
    }
};
