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
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->date('expense_date')->nullable();
            $table->string('or_si_no');
            $table->text('description');
            $table->string('location')->nullable();
            $table->string('store')->nullable();
            $table->integer('quantity')->nullable();
            $table->string('unit')->nullable();
            $table->string('size_dimension')->nullable();
            $table->decimal('unit_price', 10, 2)->nullable();
            $table->decimal('total_price', 10, 2);
            $table->string('category');
            $table->json('images')->nullable(); // Store array of image data
            $table->string('mop_type')->nullable(); // PDC, PO, CARD
            $table->string('mop_details')->nullable(); // Additional MOP details
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};

