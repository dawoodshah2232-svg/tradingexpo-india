<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\BookingConfirmation;
use App\Models\Booking;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class BookingController extends Controller
{
    private const REF_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    private function randomCode(int $length): string
    {
        $chars = self::REF_CHARS;
        $max = strlen($chars) - 1;
        $code = '';
        for ($i = 0; $i < $length; $i++) {
            $code .= $chars[random_int(0, $max)];
        }
        return $code;
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type' => ['required', 'in:ticket,exhibitor'],
            'pass_name' => ['required', 'string', 'max:120'],
            'qty' => ['nullable', 'integer', 'min:1', 'max:100'],
            'total' => ['nullable', 'integer', 'min:0', 'max:100000000'],
            'name' => ['required', 'string', 'max:120'],
            'company' => ['nullable', 'string', 'max:160'],
            'email' => ['required', 'email:rfc', 'max:190'],
            'phone' => ['required', 'string', 'max:40'],
            'extra' => ['nullable', 'array'],
            'extra.city' => ['nullable', 'string', 'max:120'],
            'extra.website' => ['nullable', 'string', 'max:255'],
            'extra.category' => ['nullable', 'string', 'max:120'],
        ]);

        $prefix = $data['type'] === 'exhibitor' ? 'EXB27' : 'TXI27';
        $extra = $data['extra'] ?? [];
        $password = $this->randomCode(6);

        // Retry on the (astronomically unlikely) ref collision.
        $booking = null;
        for ($attempt = 0; $attempt < 5; $attempt++) {
            try {
                $booking = Booking::create([
                    'type' => $data['type'],
                    'ref' => $prefix . '-' . $this->randomCode(6),
                    'password_hash' => Hash::make($password),
                    'pass_name' => $data['pass_name'],
                    'qty' => $data['qty'] ?? 1,
                    'total' => $data['total'] ?? 0,
                    'name' => $data['name'],
                    'company' => $data['company'] ?? null,
                    'email' => $data['email'],
                    'phone' => $data['phone'],
                    'city' => $extra['city'] ?? null,
                    'website' => $extra['website'] ?? null,
                    'category' => $extra['category'] ?? null,
                ]);
                break;
            } catch (QueryException $e) {
                // 23000 = integrity constraint violation (duplicate ref); retry.
                if (($e->errorInfo[0] ?? null) !== '23000' || $attempt === 4) {
                    throw $e;
                }
            }
        }

        // Confirmation email — must never fail the booking.
        try {
            Mail::to($booking->email)->send(new BookingConfirmation($booking, $password));
        } catch (\Throwable $e) {
            report($e);
        }

        return response()->json([
            'ok' => true,
            'ref' => $booking->ref,
            'password' => $password,
        ], 201);
    }
}
