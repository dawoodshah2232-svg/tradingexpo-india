<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ContactNotification;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email:rfc', 'max:190'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $message = ContactMessage::create($data);

        // Notify the organizer — must never fail the submission.
        try {
            $to = (string) config('txi.contact_to');
            if ($to !== '') {
                Mail::to($to)->send(new ContactNotification($message));
            }
        } catch (\Throwable $e) {
            report($e);
        }

        return response()->json(['ok' => true, 'id' => $message->id], 201);
    }
}
