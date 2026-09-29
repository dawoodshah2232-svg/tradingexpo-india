<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $audience = $request->query('audience');

        $query = Announcement::orderByDesc('created_at')->orderByDesc('id');
        if (in_array($audience, ['exhibitor', 'ticket'], true)) {
            $query->whereIn('audience', ['all', $audience]);
        }

        return response()->json([
            'data' => $query->get()->map(function (Announcement $a) {
                return $a->toApiArray();
            })->all(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'body' => ['required', 'string', 'max:5000'],
            'audience' => ['nullable', 'in:all,exhibitor,ticket'],
        ]);

        $announcement = Announcement::create([
            'title' => $data['title'],
            'body' => $data['body'],
            'audience' => $data['audience'] ?? 'all',
        ]);

        return response()->json(['ok' => true, 'id' => $announcement->id], 201);
    }
}
