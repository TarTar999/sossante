<?php

namespace App\Models;

use App\Enums\RecordRelationship;
use Database\Factories\HealthRecordFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property int $user_id
 * @property string $name
 * @property string|null $cover_photo
 * @property Carbon|null $date_of_birth
 * @property RecordRelationship $relationship
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 * @property-read User $user
 * @property-read Collection<int, HealthRecordPage> $pages
 */
#[Fillable([
    'user_id',
    'name',
    'cover_photo',
    'date_of_birth',
    'relationship',
])]
class HealthRecord extends Model
{
    /** @use HasFactory<HealthRecordFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Get the user that owns this health record.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the pages of this health record.
     *
     * @return HasMany<HealthRecordPage, $this>
     */
    public function pages(): HasMany
    {
        return $this->hasMany(HealthRecordPage::class)->orderBy('page_number');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'relationship' => RecordRelationship::class,
        ];
    }

    /**
     * Get the cover photo URL.
     */
    public function getCoverPhotoUrlAttribute(): ?string
    {
        if (! $this->cover_photo) {
            return null;
        }

        return Storage::url($this->cover_photo);
    }

    /**
     * Get the next page number for this record.
     */
    public function getNextPageNumber(): int
    {
        return ($this->pages()->max('page_number') ?? 0) + 1;
    }

    /**
     * Get the total number of pages.
     */
    public function getPagesCountAttribute(): int
    {
        return $this->pages()->count();
    }
}
