<?php

namespace App\Models;

use App\Enums\BloodType;
use Database\Factories\UserProfileFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string|null $cni
 * @property Carbon|null $date_of_birth
 * @property string|null $phone
 * @property string|null $address
 * @property string|null $emergency_contact_name
 * @property string|null $emergency_contact_phone
 * @property BloodType|null $blood_type
 * @property string|null $allergies
 * @property string|null $chronic_conditions
 * @property bool $is_verified_doctor
 * @property string|null $doctor_license_number
 * @property string|null $doctor_specialization
 * @property Carbon|null $doctor_verified_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 */
#[Fillable([
    'user_id',
    'cni',
    'date_of_birth',
    'phone',
    'address',
    'emergency_contact_name',
    'emergency_contact_phone',
    'blood_type',
    'allergies',
    'chronic_conditions',
    'is_verified_doctor',
    'doctor_license_number',
    'doctor_specialization',
    'doctor_verified_at',
])]
class UserProfile extends Model
{
    /** @use HasFactory<UserProfileFactory> */
    use HasFactory;

    /**
     * Get the user that owns this profile.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
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
            'blood_type' => BloodType::class,
            'is_verified_doctor' => 'boolean',
            'doctor_verified_at' => 'datetime',
        ];
    }

    /**
     * Check if the user is a verified doctor.
     */
    public function isVerifiedDoctor(): bool
    {
        return $this->is_verified_doctor && $this->doctor_verified_at !== null;
    }

    /**
     * Get basic info visible to everyone.
     *
     * @return array<string, mixed>
     */
    public function getBasicInfo(): array
    {
        return [
            'name' => $this->user->name,
            'emergency_contact_name' => $this->emergency_contact_name,
            'emergency_contact_phone' => $this->emergency_contact_phone,
        ];
    }

    /**
     * Get medical info visible only to doctors.
     *
     * @return array<string, mixed>
     */
    public function getMedicalInfo(): array
    {
        return [
            ...$this->getBasicInfo(),
            'date_of_birth' => $this->date_of_birth?->format('Y-m-d'),
            'blood_type' => $this->blood_type?->value,
            'allergies' => $this->allergies,
            'chronic_conditions' => $this->chronic_conditions,
        ];
    }
}
