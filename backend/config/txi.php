<?php

return [

    /*
    |----------------------------------------------------------------------
    | Trading Expo India — application settings
    |----------------------------------------------------------------------
    |
    | Admin credentials are read from the environment and are NEVER
    | hardcoded. Create the admin row with:
    |   php artisan db:seed --class=AdminUserSeeder
    |
    */

    'admin_user' => env('ADMIN_USER', ''),
    'admin_password' => env('ADMIN_PASSWORD', ''),
    'admin_password_hash' => env('ADMIN_PASSWORD_HASH', ''),

    // Organizer inbox for contact-form notifications.
    'contact_to' => env('CONTACT_TO', ''),

    // Public frontend origin (used for CORS).
    'frontend_url' => env('FRONTEND_URL', ''),
];
