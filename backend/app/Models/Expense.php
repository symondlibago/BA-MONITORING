<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'expense_date',
        'or_si_no',
        'description',
        'location',
        'store',
        'quantity',
        'unit',
        'size_dimension',
        'unit_price',
        'total_price',
        'category',
        'images',
        'mop_type',
        'mop_details'
    ];

    protected $casts = [
        'expense_date' => 'date',
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'images' => 'array' // Cast JSON to array
    ];

    /**
     * Get the DR/SI number with proper formatting
     */
    protected function drSiNo(): Attribute
    {
        return Attribute::make(
            get: fn (mixed $value, array $attributes) =>
                str_replace(['OR-', 'SI-', 'or-', 'si-'], ['DR-', 'SI-', 'DR-', 'SI-'], $attributes['or_si_no'] ?? ''),
        );
    }

    /**
     * Get the first image URL for display
     */
    protected function primaryImageUrl(): Attribute
    {
        return Attribute::make(
            get: function (mixed $value, array $attributes) {
                $images = $attributes['images'] ?? [];
                return !empty($images) ? $images[0]['secure_url'] ?? null : null;
            },
        );
    }

    /**
     * Get the count of additional images (beyond the first one)
     */
    protected function additionalImagesCount(): Attribute
    {
        return Attribute::make(
            get: function (mixed $value, array $attributes) {
                $images = $attributes['images'] ?? [];
                return max(0, count($images) - 1);
            },
        );
    }

    /**
     * Get formatted MOP display text
     */
    protected function mopDisplay(): Attribute
    {
        return Attribute::make(
            get: function (mixed $value, array $attributes) {
                if (empty($attributes['mop_type'])) {
                    return null;
                }

                $mopType = $attributes['mop_type'];
                $mopDetails = $attributes['mop_details'];

                return $mopDetails ? "{$mopType} - {$mopDetails}" : $mopType;
            },
        );
    }

    /**
     * Scope to filter by MOP type
     */
    public function scopeByMopType($query, $mopType)
    {
        return $query->where('mop_type', $mopType);
    }

    /**
     * Scope to filter expenses with images
     */
    public function scopeWithImages($query)
    {
        return $query->whereNotNull('images')
                     ->where('images', '!=', '[]')
                     ->where('images', '!=', 'null');
    }

    /**
     * Scope to filter expenses without images
     */
    public function scopeWithoutImages($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('images')
              ->orWhere('images', '[]')
              ->orWhere('images', 'null');
        });
    }
}
