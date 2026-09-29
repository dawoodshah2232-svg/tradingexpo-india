<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('type', 20); // ticket | exhibitor
            $table->string('ref', 20)->unique();
            $table->string('password_hash');
            $table->string('pass_name');
            $table->unsignedInteger('qty')->default(1);
            $table->unsignedInteger('total')->default(0); // INR
            $table->string('name')->nullable();
            $table->string('company')->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 40)->nullable();
            $table->string('city')->nullable();
            $table->string('website')->nullable();
            $table->string('category')->nullable();
            $table->timestamps();

            $table->index('type');
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
