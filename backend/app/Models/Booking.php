<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'type', 'ref', 'password_hash', 'pass_name', 'qty', 'total',
        'name', 'company', 'email', 'phone', 'city', 'website', 'category',
    ];

    protected $hidden = ['password_hash'];

    /**
     * Public-safe representation. Mirrors the legacy static-site demo
     * record shape (option{} / fields{} / at) so the React portal keeps
     * working unchanged against the real backend.
     */
    public function toPortalArray(): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            '_kind' => $this->type,
            'ref' => $this->ref,
            'pass_name' => $this->pass_name,
            'option' => ['name' => $this->pass_name, 'price' => (int) $this->total, 'note' => ''],
            'qty' => (int) $this->qty,
            'total' => (int) $this->total,
            'name' => $this->name,
            'company' => $this->company,
            'email' => $this->email,
            'phone' => $this->phone,
            'city' => $this->city,
            'website' => $this->website,
            'category' => $this->category,
            'fields' => [
                'name' => $this->name,
                'company' => $this->company,
                'email' => $this->email,
                'phone' => $this->phone,
                'city' => $this->city,
                'website' => $this->website,
                'category' => $this->category,
            ],
            'at' => $this->created_at ? $this->created_at->toISOString() : null,
            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
        ];
    }
}
