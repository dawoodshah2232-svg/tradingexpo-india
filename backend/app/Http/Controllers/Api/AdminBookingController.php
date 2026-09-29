<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminBookingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Booking::orderByDesc('created_at')->orderByDesc('id');

        if ($request->filled('type')) {
            $request->validate(['type' => ['in:ticket,exhibitor']]);
            $query->where('type', $request->query('type'));
        }

        if ($request->filled('q')) {
            $q = '%' . $request->query('q') . '%';
            $query->where(function ($w) use ($q) {
                $w->where('ref', 'like', $q)
                    ->orWhere('name', 'like', $q)
                    ->orWhere('email', 'like', $q)
                    ->orWhere('company', 'like', $q)
                    ->orWhere('phone', 'like', $q);
            });
        }

        $perPage = (int) $request->query('per_page', 100);
        $perPage = max(1, min($perPage, 500));

        $paginator = $query->paginate($perPage);

        return response()->json([
            'data' => $paginator->getCollection()->map(function (Booking $b) {
                return $b->toPortalArray();
            })->all(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }
}
