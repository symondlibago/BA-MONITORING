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
        Schema::create('materials', function (Blueprint $table) {
            $table->id();
            $table->string('project');
            $table->string('project_location');
            $table->date('date');
            $table->text('materials')->nullable();
            $table->string('quantity')->nullable();
            $table->enum('status', ['pending', 'approved'])->default('pending');
            $table->timestamps();
            
            // Add indexes for better performance
            $table->index('status');
            $table->index('date');
            $table->index('project');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('materials');
    }
};

