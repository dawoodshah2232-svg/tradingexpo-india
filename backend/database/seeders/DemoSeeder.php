<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\Booking;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * DEMO DATA ONLY — for local development / staging previews.
 *
 * Mirrors the original static site's localStorage demo store
 * (TXI27-DEMO / EXB27-DEMO, demo123). NEVER run in production:
 *   php artisan db:seed --class=DemoSeeder   # local dev only
 *
 * This seeder is intentionally NOT called by DatabaseSeeder.
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        Booking::updateOrCreate(
            ['ref' => 'TXI27-DEMO'],
            [
                'type' => 'ticket',
                'password_hash' => Hash::make('demo123'),
                'pass_name' => 'Pro Trader Pass',
                'qty' => 1,
                'total' => 999,
                'name' => 'Demo Trader',
                'email' => 'demo@tradingexpo.com',
                'phone' => '+91 90000 00000',
                'city' => 'Mumbai',
            ]
        );

        Booking::updateOrCreate(
            ['ref' => 'EXB27-DEMO'],
            [
                'type' => 'exhibitor',
                'password_hash' => Hash::make('demo123'),
                'pass_name' => 'Premium 6×3m',
                'qty' => 1,
                'total' => 0,
                'name' => 'Demo Exhibitor',
                'company' => 'Demo Fintech Pvt Ltd',
                'email' => 'demo@tradingexpo.com',
                'phone' => '+91 90000 00001',
                'website' => 'https://example.com',
                'category' => 'Fintech',
            ]
        );

        $announcements = [
            [
                'title' => 'Early bird pricing is live',
                'audience' => 'all',
                'body' => 'Trader Pass ₹249, Pro Trader ₹999, VIP ₹2,499 — prices rise soon. Share the expo with your trading community.',
            ],
            [
                'title' => 'Exhibitor manual & booth allocation',
                'audience' => 'exhibitor',
                'body' => 'The exhibitor manual with setup timings, freight and branding guidelines will be published here. Complete your company profile and team details so we can prepare your badges.',
            ],
            [
                'title' => 'Lucky draw on Day 2',
                'audience' => 'ticket',
                'body' => 'Every ticket is automatically entered into the Trading Expo lucky draw on 24 April. Be in the hall to win.',
            ],
        ];

        foreach ($announcements as $a) {
            Announcement::firstOrCreate(
                ['title' => $a['title'], 'audience' => $a['audience']],
                ['body' => $a['body']]
            );
        }

        $this->command->info('DemoSeeder: demo bookings + announcements created (NOT for production).');
    }
}
