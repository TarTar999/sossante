<?php

namespace Database\Factories;

use App\Enums\ConsultationStatus;
use App\Enums\ConsultationUrgency;
use App\Models\ConsultationRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ConsultationRequest>
 */
class ConsultationRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'patient_id' => User::factory(),
            'doctor_id' => null,
            'urgency' => fake()->randomElement(ConsultationUrgency::cases()),
            'status' => ConsultationStatus::Pending,
            'symptoms' => fake()->paragraph(),
            'qr_code' => Str::random(64),
            'qr_scanned_at' => null,
            'consultation_started_at' => null,
            'consultation_ended_at' => null,
            'notes' => null,
        ];
    }

    /**
     * Set the urgency to standard.
     */
    public function standard(): static
    {
        return $this->state(fn (array $attributes) => [
            'urgency' => ConsultationUrgency::Standard,
        ]);
    }

    /**
     * Set the urgency to urgent.
     */
    public function urgent(): static
    {
        return $this->state(fn (array $attributes) => [
            'urgency' => ConsultationUrgency::Urgent,
        ]);
    }

    /**
     * Set the urgency to very urgent.
     */
    public function veryUrgent(): static
    {
        return $this->state(fn (array $attributes) => [
            'urgency' => ConsultationUrgency::VeryUrgent,
        ]);
    }

    /**
     * Set the consultation as accepted by a doctor.
     */
    public function accepted(?User $doctor = null): static
    {
        return $this->state(fn (array $attributes) => [
            'doctor_id' => $doctor?->id ?? User::factory(),
            'status' => ConsultationStatus::Accepted,
        ]);
    }

    /**
     * Set the consultation as in progress.
     */
    public function inProgress(?User $doctor = null): static
    {
        return $this->state(fn (array $attributes) => [
            'doctor_id' => $doctor?->id ?? User::factory(),
            'status' => ConsultationStatus::InProgress,
            'qr_scanned_at' => now(),
            'consultation_started_at' => now(),
        ]);
    }

    /**
     * Set the consultation as completed.
     */
    public function completed(?User $doctor = null): static
    {
        $startTime = now()->subMinutes(fake()->numberBetween(10, 60));

        return $this->state(fn (array $attributes) => [
            'doctor_id' => $doctor?->id ?? User::factory(),
            'status' => ConsultationStatus::Completed,
            'qr_scanned_at' => $startTime,
            'consultation_started_at' => $startTime,
            'consultation_ended_at' => now(),
            'notes' => fake()->paragraph(),
        ]);
    }

    /**
     * Set the consultation as cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ConsultationStatus::Cancelled,
        ]);
    }
}
