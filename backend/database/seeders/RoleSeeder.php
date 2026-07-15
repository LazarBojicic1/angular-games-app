<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Role::query()->firstOrCreate(
            ['name' => Role::ADMIN],
            ['label' => 'Administrator'],
        );
        Role::query()->firstOrCreate(
            ['name' => Role::USER],
            ['label' => 'User'],
        );
    }
}
