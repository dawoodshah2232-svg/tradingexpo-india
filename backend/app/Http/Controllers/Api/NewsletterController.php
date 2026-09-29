<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email:rfc', 'max:190', 'unique:newsletter_subscribers,email'],
        ]);

        $subscriber = NewsletterSubscriber::create($data);

        return response()->json(['ok' => true, 'id' => $subscriber->id], 201);
    }
}
