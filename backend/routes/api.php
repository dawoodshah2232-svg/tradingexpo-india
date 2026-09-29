<?php

use App\Http\Controllers\Api\AdminBookingController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\NewsletterController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Trading Expo India 2027 API
|--------------------------------------------------------------------------
|
| Public endpoints are stateless. The React frontend (frontend/src/lib/api.js)
| falls back to its localStorage demo store whenever these endpoints are
| unreachable (e.g. the static GitHub Pages preview).
|
*/

// Health check
Route::get('/health', function () {
    return response()->json(['ok' => true, 'app' => config('app.name')]);
});

// Bookings — strict throttle (10/min)
Route::post('/bookings', [BookingController::class, 'store'])->middleware('throttle:strict');

// Portal + admin auth — strict throttle (10/min)
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:strict');
Route::post('/auth/admin', [AuthController::class, 'adminLogin'])->middleware('throttle:strict');

// Announcements — public read; admin-only write
Route::get('/announcements', [AnnouncementController::class, 'index']);

// Contact + newsletter — strict throttle (10/min)
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:strict');
Route::post('/newsletter', [NewsletterController::class, 'store'])->middleware('throttle:strict');

// Authenticated (Sanctum) routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/announcements', [AnnouncementController::class, 'store']);
    Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy']);
    Route::get('/admin/bookings', [AdminBookingController::class, 'index']);
});
