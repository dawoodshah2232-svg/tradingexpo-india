<?php

namespace Tests\Feature;

use App\Models\Announcement;
use App\Models\Booking;
use App\Models\NewsletterSubscriber;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ExpoApiTest extends TestCase
{
    use RefreshDatabase;

    /* ---------------- Bookings ---------------- */

    public function test_booking_creates_ref_and_password(): void
    {
        $res = $this->postJson('/api/bookings', [
            'type' => 'ticket',
            'pass_name' => 'Pro Trader Pass',
            'qty' => 2,
            'total' => 1998,
            'name' => 'Test Trader',
            'email' => 'trader@example.com',
            'phone' => '+91 90000 00000',
            'extra' => ['city' => 'Mumbai'],
        ]);

        $res->assertCreated()
            ->assertJsonStructure(['ok', 'ref', 'password'])
            ->assertJson(['ok' => true]);

        $ref = $res->json('ref');
        $password = $res->json('password');
        $this->assertMatchesRegularExpression('/^TXI27-[A-Z2-9]{6}$/', $ref);
        $this->assertMatchesRegularExpression('/^[A-Z2-9]{6}$/', $password);

        $booking = Booking::where('ref', $ref)->first();
        $this->assertNotNull($booking);
        $this->assertTrue(Hash::check($password, $booking->password_hash));
        // The hash itself must never leak in API output.
        $this->assertArrayNotHasKey('password_hash', $booking->toPortalArray());
    }

    public function test_exhibitor_booking_uses_exb_prefix(): void
    {
        $res = $this->postJson('/api/bookings', [
            'type' => 'exhibitor',
            'pass_name' => 'Premium 6×3m',
            'name' => 'Test Exhibitor',
            'company' => 'Test Fintech',
            'email' => 'ex@example.com',
            'phone' => '+91 90000 00001',
        ]);

        $res->assertCreated();
        $this->assertMatchesRegularExpression('/^EXB27-[A-Z2-9]{6}$/', $res->json('ref'));
    }

    public function test_booking_validation_rejects_bad_input(): void
    {
        $res = $this->postJson('/api/bookings', [
            'type' => 'vip', // invalid
            'name' => 'x',
            'email' => 'not-an-email',
            'phone' => '1',
        ]);

        $res->assertStatus(422)->assertJsonValidationErrors(['type', 'email', 'pass_name']);
    }

    /* ---------------- Booking-holder login ---------------- */

    public function test_login_succeeds_with_ref_and_password(): void
    {
        $created = $this->postJson('/api/bookings', [
            'type' => 'ticket',
            'pass_name' => 'Trader Pass',
            'name' => 'Login Tester',
            'email' => 'login@example.com',
            'phone' => '+91 90000 00002',
        ])->assertCreated();

        $res = $this->postJson('/api/auth/login', [
            'ref' => strtolower($created->json('ref')), // case-insensitive
            'password' => $created->json('password'),
        ]);

        $res->assertOk()
            ->assertJson(['ok' => true, 'role' => 'ticket'])
            ->assertJsonStructure(['ok', 'role', 'ref', 'booking']);
    }

    public function test_login_rejects_wrong_password(): void
    {
        $created = $this->postJson('/api/bookings', [
            'type' => 'ticket',
            'pass_name' => 'Trader Pass',
            'name' => 'Login Tester',
            'email' => 'login2@example.com',
            'phone' => '+91 90000 00003',
        ])->assertCreated();

        $this->postJson('/api/auth/login', [
            'ref' => $created->json('ref'),
            'password' => 'WRONG1',
        ])->assertStatus(401)->assertJson(['ok' => false]);
    }

    public function test_login_rejects_role_mismatch(): void
    {
        $created = $this->postJson('/api/bookings', [
            'type' => 'ticket',
            'pass_name' => 'Trader Pass',
            'name' => 'Role Tester',
            'email' => 'role@example.com',
            'phone' => '+91 90000 00004',
        ])->assertCreated();

        $this->postJson('/api/auth/login', [
            'ref' => $created->json('ref'),
            'password' => $created->json('password'),
            'role' => 'exhibitor',
        ])->assertStatus(403)->assertJson(['ok' => false]);
    }

    /* ---------------- Admin auth ---------------- */

    public function test_admin_login_rejects_bad_credentials(): void
    {
        $this->postJson('/api/auth/admin', [
            'user' => 'admin',
            'password' => 'wrong-password',
        ])->assertStatus(401)->assertJson(['ok' => false]);
    }

    public function test_admin_login_succeeds_and_issues_token(): void
    {
        User::create([
            'name' => 'admin',
            'email' => 'admin@localhost',
            'password' => Hash::make('s3cret-admin'),
            'is_admin' => true,
        ]);

        $res = $this->postJson('/api/auth/admin', [
            'user' => 'admin',
            'password' => 's3cret-admin',
        ]);

        $res->assertOk()
            ->assertJson(['ok' => true, 'role' => 'admin'])
            ->assertJsonStructure(['ok', 'role', 'token']);

        $this->assertNotEmpty($res->json('token'));
    }

    public function test_non_admin_user_cannot_get_admin_token(): void
    {
        User::create([
            'name' => 'regular',
            'email' => 'regular@localhost',
            'password' => Hash::make('s3cret-user'),
            'is_admin' => false,
        ]);

        $this->postJson('/api/auth/admin', [
            'user' => 'regular',
            'password' => 's3cret-user',
        ])->assertStatus(401);
    }

    /* ---------------- Announcements ---------------- */

    public function test_announcements_index_shape_and_audience_filter(): void
    {
        Announcement::create(['title' => 'For all', 'body' => 'hello all', 'audience' => 'all']);
        Announcement::create(['title' => 'For exhibitors', 'body' => 'hello ex', 'audience' => 'exhibitor']);

        $all = $this->getJson('/api/announcements')->assertOk();
        $all->assertJsonStructure(['data' => [['id', 'title', 'body', 'audience', 'created_at']]]);
        $this->assertCount(2, $all->json('data'));
        // Newest first
        $this->assertSame('For exhibitors', $all->json('data.0.title'));

        $filtered = $this->getJson('/api/announcements?audience=ticket')->assertOk();
        $this->assertCount(1, $filtered->json('data'));
        $this->assertSame('For all', $filtered->json('data.0.title'));
    }

    public function test_announcement_store_requires_auth(): void
    {
        $this->postJson('/api/announcements', [
            'title' => 'Hack attempt',
            'body' => 'should not be stored',
        ])->assertStatus(401);

        $this->assertSame(0, Announcement::count());
    }

    public function test_admin_can_publish_announcement(): void
    {
        $admin = User::create([
            'name' => 'admin',
            'email' => 'admin@localhost',
            'password' => Hash::make('s3cret-admin'),
            'is_admin' => true,
        ]);
        $token = $admin->createToken('test')->plainTextToken;

        $res = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/announcements', [
                'title' => 'Doors open',
                'body' => 'See you at the expo.',
                'audience' => 'ticket',
            ]);

        $res->assertCreated()->assertJson(['ok' => true])->assertJsonStructure(['ok', 'id']);
        $this->assertSame(1, Announcement::count());
    }

    public function test_announcement_delete_requires_auth_and_removes(): void
    {
        $ann = Announcement::create([
            'title' => 'Old news',
            'body' => 'stale',
            'audience' => 'all',
        ]);

        $this->deleteJson('/api/announcements/' . $ann->id)->assertStatus(401);
        $this->assertSame(1, Announcement::count());

        $admin = User::create([
            'name' => 'admin',
            'email' => 'admin@localhost',
            'password' => Hash::make('s3cret-admin'),
            'is_admin' => true,
        ]);
        $token = $admin->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson('/api/announcements/' . $ann->id)
            ->assertOk()
            ->assertJson(['ok' => true]);
        $this->assertSame(0, Announcement::count());
    }

    /* ---------------- Admin bookings ---------------- */

    public function test_admin_bookings_requires_auth_and_returns_shape(): void
    {
        $this->getJson('/api/admin/bookings')->assertStatus(401);

        Booking::create([
            'type' => 'ticket',
            'ref' => 'TXI27-ABC123',
            'password_hash' => Hash::make('secret'),
            'pass_name' => 'Trader Pass',
            'qty' => 1,
            'total' => 249,
            'name' => 'Shape Tester',
            'email' => 'shape@example.com',
            'phone' => '+91 90000 00005',
        ]);

        $admin = User::create([
            'name' => 'admin',
            'email' => 'admin@localhost',
            'password' => Hash::make('s3cret-admin'),
            'is_admin' => true,
        ]);
        $token = $admin->createToken('test')->plainTextToken;

        $res = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/admin/bookings');

        $res->assertOk()->assertJsonStructure(['data', 'meta']);
        $item = $res->json('data.0');
        $this->assertSame('TXI27-ABC123', $item['ref']);
        $this->assertSame('ticket', $item['type']);
        $this->assertArrayHasKey('option', $item);
        $this->assertArrayHasKey('fields', $item);
        $this->assertArrayNotHasKey('password_hash', $item);
    }

    /* ---------------- Contact + newsletter ---------------- */

    public function test_contact_stores_message(): void
    {
        $res = $this->postJson('/api/contact', [
            'name' => 'Curious Visitor',
            'email' => 'visitor@example.com',
            'message' => 'What are the expo dates?',
        ]);

        $res->assertCreated()->assertJson(['ok' => true]);
        $this->assertDatabaseHas('contact_messages', ['email' => 'visitor@example.com']);
    }

    public function test_contact_validation(): void
    {
        $this->postJson('/api/contact', [
            'name' => 'x',
            'email' => 'bad',
        ])->assertStatus(422)->assertJsonValidationErrors(['email', 'message']);
    }

    public function test_newsletter_subscribes_and_rejects_duplicates(): void
    {
        $this->postJson('/api/newsletter', ['email' => 'fan@example.com'])
            ->assertCreated()
            ->assertJson(['ok' => true]);

        $this->assertSame(1, NewsletterSubscriber::count());

        $this->postJson('/api/newsletter', ['email' => 'fan@example.com'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_newsletter_rejects_bad_email(): void
    {
        $this->postJson('/api/newsletter', ['email' => 'not-an-email'])
            ->assertStatus(422);
    }
}
