<?php
// Trading Expo India 2027 — backend configuration (cPanel hosting)
// 1. Create a MySQL database + user in cPanel, import db/schema.sql via phpMyAdmin.
// 2. Fill in the credentials below and upload the api/ folder next to the website.

define('DB_HOST', 'localhost');
define('DB_NAME', 'yourdb_tradingexpo');
define('DB_USER', 'yourdb_expo');
define('DB_PASS', 'CHANGE_ME');

define('SITE_NAME', 'Trading Expo India 2027');
define('SITE_URL', 'https://yourdomain.com');
define('FROM_EMAIL', 'tickets@yourdomain.com');
define('FROM_NAME', 'Trading Expo India');

function db() {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER, DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
        );
    }
    return $pdo;
}

function json_out($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function random_code($len = 6) {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $s = '';
    for ($i = 0; $i < $len; $i++) $s .= $chars[random_int(0, strlen($chars) - 1)];
    return $s;
}
