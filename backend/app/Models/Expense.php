<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'or_si_no',
        'description',
        'location',
        'store',
        'quantity', // Now string instead of integer
        'size_dimension',
        'unit_price',
        'total_price',
        'mop', // Mode of payment
        'mop_description', // MOP description
        'category',
        'images' // Multiple image paths
    ];

    protected $casts = [
        'date' => 'date',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'images' => 'array' // Cast JSON to array
    ];
}

