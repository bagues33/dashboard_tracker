<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qa_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checklist_id')->constrained()->cascadeOnDelete();
            $table->string('title', 255);
            $table->string('status', 30)->default('to do'); // to do, in progress, done dev, re open, done
            $table->string('priority', 20)->default('medium');
            $table->text('expected_result')->nullable();
            $table->text('steps_to_reproduce')->nullable();
            $table->string('image_url', 1000)->nullable();
            $table->string('error_url', 1000)->nullable();
            $table->integer('position')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qa_details');
    }
};
