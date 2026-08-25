<?php

namespace App\Models;

use App\Enums\ConsultationStatus;
use App\Enums\ConsultationUrgency;
use Database\Factories\ConsultationRequestFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int $patient_id
 * @property int|null $doctor_id
 * @property ConsultationUrgency $urgency
 * @property ConsultationStatus $status
 * @property string $symptoms
 * @property string $qr_code
 * @property Carbon|null $qr_scanned_at
 * @property Carbon|null $consultation_started_at
 * @property Carbon|null $consultation_ended_at
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $patient
 * @property-read User|null $doctor
 */
#[Fillable([
    'patient_id',
    'doctor_id',
    'urgency',
    'status',
    'symptoms',
    'qr_code',
    'qr_scanned_at',
    'consultation_started_at',
    'consultation_ended_at',
    'notes',
])]
class ConsultationRequest extends Model
{
    /** @use HasFactory<ConsultationRequestFactory> */
    use HasFactory;

    /**
     * Bootstrap the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (ConsultationRequest $request) {
            if (empty($request->qr_code)) {
                $request->qr_code = Str::random(64);
            }
        });
    }

    /**
     * Get the patient that created this request.
     *
     * @return BelongsTo<User, $this>
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    /**
     * Get the doctor assigned to this request.
     *
     * @return BelongsTo<User, $this>
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'urgency' => ConsultationUrgency::class,
            'status' => ConsultationStatus::class,
            'qr_scanned_at' => 'datetime',
            'consultation_started_at' => 'datetime',
            'consultation_ended_at' => 'datetime',
        ];
    }

    /**
     * Scope to get pending consultations.
     */
    public function scopePending($query)
    {
        return $query->where('status', ConsultationStatus::Pending);
    }

    /**
     * Scope to get active consultations (not completed or cancelled).
     */
    public function scopeActive($query)
    {
        return $query->whereNotIn('status', [
            ConsultationStatus::Completed,
            ConsultationStatus::Cancelled,
        ]);
    }

    /**
     * Scope to order by urgency (most urgent first).
     */
    public function scopeOrderByUrgency($query)
    {
        return $query->orderByRaw("CASE
            WHEN urgency = 'very_urgent' THEN 1
            WHEN urgency = 'urgent' THEN 2
            ELSE 3
        END");
    }

    /**
     * Check if the consultation can be accepted.
     */
    public function canBeAccepted(): bool
    {
        return $this->status === ConsultationStatus::Pending && $this->doctor_id === null;
    }

    /**
     * Check if the consultation can be started (QR scanned).
     */
    public function canBeStarted(): bool
    {
        return $this->status === ConsultationStatus::Accepted && $this->qr_scanned_at === null;
    }

    /**
     * Check if the consultation can be completed.
     */
    public function canBeCompleted(): bool
    {
        return $this->status === ConsultationStatus::InProgress;
    }

    /**
     * Check if the consultation can be cancelled.
     */
    public function canBeCancelled(): bool
    {
        return $this->status->canBeCancelled();
    }

    /**
     * Accept the consultation by a doctor.
     */
    public function accept(User $doctor): void
    {
        $this->update([
            'doctor_id' => $doctor->id,
            'status' => ConsultationStatus::Accepted,
        ]);
    }

    /**
     * Start the consultation (after QR scan).
     */
    public function start(): void
    {
        $this->update([
            'qr_scanned_at' => now(),
            'consultation_started_at' => now(),
            'status' => ConsultationStatus::InProgress,
        ]);
    }

    /**
     * Complete the consultation.
     */
    public function complete(?string $notes = null): void
    {
        $this->update([
            'consultation_ended_at' => now(),
            'status' => ConsultationStatus::Completed,
            'notes' => $notes,
        ]);
    }

    /**
     * Cancel the consultation.
     */
    public function cancel(): void
    {
        $this->update([
            'status' => ConsultationStatus::Cancelled,
        ]);
    }

    /**
     * Get the duration of the consultation in minutes.
     */
    public function getDurationInMinutes(): ?int
    {
        if (! $this->consultation_started_at) {
            return null;
        }

        $endTime = $this->consultation_ended_at ?? now();

        return $this->consultation_started_at->diffInMinutes($endTime);
    }
}
