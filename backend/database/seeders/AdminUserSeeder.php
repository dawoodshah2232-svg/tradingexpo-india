<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Creates (or updates) the single portal admin user from environment
 * credentials. Run explicitly on the server — never auto-seeded:
 *
 *   ADMIN_USER=admin ADMIN_PASSWORD='choose-a-strong-password' \
 *       php artisan db:seed --class=AdminUserSeeder
 *
 * Alternatively set ADMIN_PASSWORD_HASH to a bcrypt hash and leave
 * ADMIN_PASSWORD empty.
 */
class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $username = (string) config('txi.admin_user');
        $password = (string) config('txi.admin_password');
        $hash = (string) config('txi.admin_password_hash');

        if ($username === '' || ($password === '' && $hash === '')) {
            $this->command->warn('AdminUserSeeder skipped: set ADMIN_USER and ADMIN_PASSWORD (or ADMIN_PASSWORD_HASH) in .env first.');
            return;
        }

        $email = filter_var($username, FILTER_VALIDATE_EMAIL) ? $username : $username . '@localhost';

        $user = User::where('email', $email)->orWhere('name', $username)->first();
        if (!$user) {
            $user = new User();
            $user->name = $username;
            $user->email = $email;
        }

        $user->password = $hash !== '' ? $hash : Hash::make($password);
        $user->is_admin = true;
        $user->save();

        $this->command->info("Admin user '{$user->name}' is ready.");
    }
}
