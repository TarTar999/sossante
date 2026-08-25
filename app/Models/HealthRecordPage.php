<?php

namespace App\Models;

use Database\Factories\HealthRecordPageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property int $health_record_id
 * @property int $page_number
 * @property string $image_path
 * @property string|null $notes
 * @property Carbon|null $scanned_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read HealthRecord $healthRecord
 */
#[Fillable([
    'health_record_id',
    'page_number',
    'image_path',
    'notes',
    'scanned_at',
])]
class HealthRecordPage extends Model
{
    /** @use HasFactory<HealthRecordPageFactory> */
    use HasFactory;

    /**
     * Get the health record that owns this page.
     *
     * @return BelongsTo<HealthRecord, $this>
     */
    public function healthRecord(): BelongsTo
    {
        return $this->belongsTo(HealthRecord::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'scanned_at' => 'datetime',
            'page_number' => 'integer',
        ];
    }

    /**
     * Get the image URL.
     */
    public function getImageUrlAttribute(): string
    {
        return Storage::url($this->image_path);
    }
}
