<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('body');
            $table->string('audience', 20)->default('all'); // all | exhibitor | ticket
            $table->timestamps();

            $table->index('audience');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
