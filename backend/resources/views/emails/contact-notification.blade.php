<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New contact message</title></head>
<body style="font-family: -apple-system, Helvetica, Arial, sans-serif; color: #1a1a2e; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h1 style="color: #0B1F3B;">New contact message</h1>
  <p><strong>Name:</strong> {{ $contactMessage->name }}<br>
  <strong>Email:</strong> {{ $contactMessage->email }}</p>
  <hr>
  <p>{{ $contactMessage->message }}</p>
</body>
</html>
