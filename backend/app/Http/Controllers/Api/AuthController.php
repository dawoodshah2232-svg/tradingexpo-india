<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Booking-holder login: reference + password.
     * Optional `role` (ticket|exhibitor) is verified against the booking type
     * when the frontend sends it.
     */
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ref' => ['required', 'string', 'max:30'],
            'password' => ['required', 'string', 'max:100'],
            'role' => ['nullable', 'in:ticket,exhibitor'],
        ]);

        $ref = strtoupper(trim($data['ref']));
        $booking = Booking::where('ref', $ref)->first();

        if (!$booking || !Hash::check($data['password'], $booking->password_hash)) {
            return response()->json([
                'ok' => false,
                'error' => 'No booking matches that reference and password. Check your booking confirmation.',
            ], 401);
        }

        if (!empty($data['role']) && $data['role'] !== $booking->type) {
            $kind = $booking->type === 'ticket' ? 'ticket' : 'booth';
            $tab = $booking->type === 'ticket' ? 'Ticket Holder' : 'Exhibitor';
            return response()->json([
                'ok' => false,
                'error' => "This reference is a {$kind} booking — please use the {$tab} tab.",
            ], 403);
        }

        return response()->json([
            'ok' => true,
            'role' => $booking->type,
            'ref' => $booking->ref,
            'booking' => $booking->toPortalArray(),
        ]);
    }

    /**
     * Admin login. Credentials live in the environment (ADMIN_USER plus
     * ADMIN_PASSWORD or ADMIN_PASSWORD_HASH) and the admin row is created by
     * `php artisan db:seed --class=AdminUserSeeder` — never hardcoded.
     */
    public function adminLogin(Request $request): JsonResponse
    {
        $data = $request->validate([
            'user' => ['required', 'string', 'max:190'],
            'password' => ['required', 'string', 'max:255'],
        ]);

        $envUser = (string) config('txi.admin_user');
        $envPass = (string) config('txi.admin_password');
        $envHash = (string) config('txi.admin_password_hash');

        $user = User::where('email', $data['user'])
            ->orWhere('name', $data['user'])
            ->first();

        $valid = $user && $user->is_admin && Hash::check($data['password'], $user->password);

        // Fallback: direct env comparison for installs where the seeder
        // has not been run yet.
        if (!$valid && $envUser !== '' && hash_equals($envUser, trim($data['user']))) {
            if ($envHash !== '' && Hash::check($data['password'], $envHash)) {
                $valid = true;
            } elseif ($envPass !== '' && hash_equals($envPass, $data['password'])) {
                $valid = true;
            }
        }

        if (!$valid) {
            return response()->json([
                'ok' => false,
                'error' => 'Invalid admin username or password.',
            ], 401);
        }

        if (!$user) {
            // Env-validated admin without a DB row: create the row on the fly
            // so the token has an owner, then keep it for next time.
            $user = User::create([
                'name' => $envUser !== '' ? $envUser : trim($data['user']),
                'email' => filter_var(trim($data['user']), FILTER_VALIDATE_EMAIL)
                    ? trim($data['user'])
                    : trim($data['user']) . '@localhost',
                'password' => Hash::make($data['password']),
                'is_admin' => true,
            ]);
        }

        $user->tokens()->delete();
        $token = $user->createToken('portal-admin')->plainTextToken;

        return response()->json([
            'ok' => true,
            'role' => 'admin',
            'ref' => 'ADMIN',
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['ok' => true]);
    }
}
