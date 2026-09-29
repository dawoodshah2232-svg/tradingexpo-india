<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Booking reserved — Trading Expo India 2027</title></head>
<body style="font-family: -apple-system, Helvetica, Arial, sans-serif; color: #1a1a2e; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h1 style="color: #0B1F3B;">Trading Expo India 2027</h1>
  <p>Hi {{ $booking->name }},</p>
  <p>Your booking is reserved. <strong>No payment was taken now</strong> — our team will confirm pricing and be in touch.</p>
  <table style="border-collapse: collapse; margin: 16px 0;">
    <tr><td style="padding: 6px 12px 6px 0; color: #666;">Booking reference</td><td style="padding: 6px 0;"><strong>{{ $booking->ref }}</strong></td></tr>
    <tr><td style="padding: 6px 12px 6px 0; color: #666;">Portal password</td><td style="padding: 6px 0;"><strong>{{ $password }}</strong></td></tr>
    <tr><td style="padding: 6px 12px 6px 0; color: #666;">{{ $booking->type === 'exhibitor' ? 'Booth' : 'Pass' }}</td><td style="padding: 6px 0;">{{ $booking->pass_name }}</td></tr>
    <tr><td style="padding: 6px 12px 6px 0; color: #666;">Quantity</td><td style="padding: 6px 0;">{{ $booking->qty }}</td></tr>
  </table>
  <p>Keep your reference and password safe — you will need them to log in to the exhibitor / ticket-holder portal.</p>
  <p style="color: #666; font-size: 13px;">Trading Expo India 2027 · 23–24 April 2027 · Organized by ProFX Media FZ-LLC</p>
</body>
</html>
