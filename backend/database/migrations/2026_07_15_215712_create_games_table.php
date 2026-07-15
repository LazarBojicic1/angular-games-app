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
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('rawg_id')->nullable()->unique();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('background_image')->nullable();
            $table->longText('description')->nullable();
            $table->text('website')->nullable();
            $table->date('released')->nullable();
            $table->decimal('rating', 3, 2)->default(0);
            $table->unsignedTinyInteger('metacritic')->nullable();
            $table->unsignedSmallInteger('playtime')->default(0);
            $table->json('developers')->nullable();
            $table->json('publishers')->nullable();
            $table->json('tags')->nullable();
            $table->json('screenshots')->nullable();
            $table->timestamps();

            $table->index(['rating', 'released']);
            $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('games');
    }
};
