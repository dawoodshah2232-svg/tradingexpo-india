Trading Expo India 2027 — production backend (cPanel + MySQL + PHP)
=====================================================================

The public preview (GitHub Pages) runs the whole site + portal in the
browser: bookings are stored in localStorage, the ticket is generated
instantly and downloadable, and portal logins work with the reference +
password shown at booking time.

To go live with real automatic ticket emails + a shared database:

1. In cPanel, create a MySQL database and a MySQL user, add the user to
   the database (all privileges).
2. In phpMyAdmin, import db/schema.sql.
3. Edit api/config.php: set DB_HOST / DB_NAME / DB_USER / DB_PASS,
   SITE_URL and FROM_EMAIL.
4. Upload the whole site (including api/ and db/) to public_html.
5. Default admin login for the portal: username `admin`, password
   `expo2027` — change it immediately (update the admin_users row with a
   fresh hash: password_hash('newpassword', PASSWORD_DEFAULT)).

How it works
------------
- POST api/book.php with the booking JSON (same shape the preview stores
  in localStorage). It creates a unique TXI27-/EXB27- reference, hashes a
  6-character portal password, stores the booking, and EMAILS the ticket
  + portal login to the customer automatically via PHP mail().
- It returns { ok, ref, password } so the confirmation screen can show
  the same credentials the customer receives by email.
- Announcements and exhibitor profile/team/uploads move to the
  announcements table and per-booking records when the frontend is
  pointed at the API (endpoints: api/announcements.php and
  api/portal.php — to be added at launch time).

Files
-----
api/config.php   database + site settings (EDIT THIS)
api/book.php     booking creation + automatic ticket email
db/schema.sql    bookings, announcements, admin_users tables
