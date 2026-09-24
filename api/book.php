<?php
// Trading Expo India 2027 — booking endpoint
// POST JSON: { type: "ticket"|"exhibitor", pass_name, qty, total, name, company, email, phone, extra:{} }
// Creates the booking, hashes the portal password, and EMAILS THE TICKET automatically.
// Response: { ok:true, ref, password } — the frontend shows these on the confirmation screen.

require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['ok' => false, 'error' => 'POST only'], 405);

$in = json_decode(file_get_contents('php://input'), true) ?: [];
$type = ($in['type'] ?? '') === 'exhibitor' ? 'exhibitor' : 'ticket';
$email = trim($in['email'] ?? '');
$name = trim($in['name'] ?? '');
$company = trim($in['company'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_out(['ok' => false, 'error' => 'Valid email required'], 422);
if ($name === '' && $company === '') json_out(['ok' => false, 'error' => 'Name required'], 422);

$prefix = $type === 'exhibitor' ? 'EXB27' : 'TXI27';
$pdo = db();

// unique reference
do {
    $ref = $prefix . '-' . random_code(6);
    $chk = $pdo->prepare('SELECT id FROM bookings WHERE ref = ?');
    $chk->execute([$ref]);
} while ($chk->fetch());

$password = random_code(6);
$passName = trim($in['pass_name'] ?? '');
$qty = max(1, (int)($in['qty'] ?? 1));
$total = max(0, (int)($in['total'] ?? 0));

$stmt = $pdo->prepare('INSERT INTO bookings (ref, type, pass_name, qty, total, name, company, email, phone, extra, password_hash)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
$stmt->execute([
    $ref, $type, $passName, $qty, $total, $name, $company, $email,
    trim($in['phone'] ?? ''), json_encode($in['extra'] ?? new stdClass()),
    password_hash($password, PASSWORD_DEFAULT)
]);

send_ticket_email($email, $name ?: $company, $ref, $password, $type, $passName, $qty, $total);

json_out(['ok' => true, 'ref' => $ref, 'password' => $password]);

function send_ticket_email($to, $holder, $ref, $password, $type, $passName, $qty, $total) {
    $portal = SITE_URL . '/portal.html';
    $totalLine = $total > 0 ? '₹' . number_format($total, 0, '.', ',') : 'To be confirmed';
    $kind = $type === 'exhibitor' ? 'Exhibitor reservation' : 'Ticket booking';

    $html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1d1d1f">'
        . '<div style="background:#0B1F3B;color:#fff;padding:28px;border-radius:14px 14px 0 0">'
        . '<h1 style="margin:0;font-size:22px">TRADING EXPO INDIA 2027</h1>'
        . '<p style="margin:6px 0 0;opacity:.8">23&ndash;24 April 2027 &middot; India</p></div>'
        . '<div style="border:1px solid #e5e5e5;border-top:none;padding:28px;border-radius:0 0 14px 14px">'
        . '<p>Hi ' . htmlspecialchars($holder) . ',</p>'
        . '<p>Your <strong>' . htmlspecialchars($kind) . '</strong> is confirmed as <strong>reserved</strong>.</p>'
        . '<table style="width:100%;border-collapse:collapse;margin:16px 0">'
        . '<tr><td style="padding:8px 0;color:#6e6e73">Pass / Booth</td><td style="text-align:right"><strong>' . htmlspecialchars($passName) . '</strong></td></tr>'
        . '<tr><td style="padding:8px 0;color:#6e6e73">Quantity</td><td style="text-align:right"><strong>' . $qty . '</strong></td></tr>'
        . '<tr><td style="padding:8px 0;color:#6e6e73">Total</td><td style="text-align:right"><strong>' . $totalLine . '</strong></td></tr>'
        . '<tr><td style="padding:8px 0;color:#6e6e73">Reference</td><td style="text-align:right"><strong style="letter-spacing:2px;color:#00A86B">' . htmlspecialchars($ref) . '</strong></td></tr>'
        . '</table>'
        . '<div style="background:#f4f8fa;border-radius:10px;padding:16px;margin:16px 0">'
        . '<strong>Your portal login</strong><br>Reference: <strong>' . htmlspecialchars($ref) . '</strong><br>Password: <strong>' . htmlspecialchars($password) . '</strong><br>'
        . '<a href="' . $portal . '" style="display:inline-block;margin-top:10px;background:#00C853;color:#04120a;font-weight:bold;text-decoration:none;padding:12px 24px;border-radius:999px">Open the Portal</a></div>'
        . '<p style="color:#6e6e73;font-size:13px">No payment has been taken. Our team will send your payment link shortly — your price is locked for 48 hours. You can download your ticket anytime from the portal.</p>'
        . '</div></div>';

    $headers = "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n"
        . 'From: ' . FROM_NAME . ' <' . FROM_EMAIL . ">\r\n"
        . 'Reply-To: ' . FROM_EMAIL . "\r\n";

    @mail($to, SITE_NAME . ' — booking ' . $ref . ' reserved', $html, $headers);
}
