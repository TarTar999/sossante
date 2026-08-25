<?php

namespace Database\Factories;

use App\Enums\BloodType;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserProfile>
 */
class UserProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'cni' => fake()->unique()->numerify('############'),
            'date_of_birth' => fake()->dateTimeBetween('-80 years', '-18 years'),
            'phone' => fake()->phoneNumber(),
            'address' => fake()->address(),
            'emergency_contact_name' => fake()->name(),
            'emergency_contact_phone' => fake()->phoneNumber(),
            'blood_type' => fake()->randomElement(BloodType::cases()),
            'allergies' => fake()->optional()->sentence(),
            'chronic_conditions' => fake()->optional()->sentence(),
            'is_verified_doctor' => false,
            'doctor_license_number' => null,
            'doctor_specialization' => null,
            'doctor_verified_at' => null,
        ];
    }

    /**
     * Indicate that the user is a verified doctor.
     */
    public function verifiedDoctor(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_verified_doctor' => true,
            'doctor_license_number' => fake()->numerify('MED-######'),
            'doctor_specialization' => fake()->randomElement([
                'Médecine générale',
                'Cardiologie',
                'Pédiatrie',
                'Dermatologie',
                'Neurologie',
                'Gynécologie',
                'Orthopédie',
            ]),
            'doctor_verified_at' => now(),
        ]);
    }

    /**
     * Indicate that the user is a pending doctor (not yet verified).
     */
    public function pendingDoctor(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_verified_doctor' => false,
            'doctor_license_number' => fake()->numerify('MED-######'),
            'doctor_specialization' => fake()->randomElement([
                'Médecine générale',
                'Cardiologie',
                'Pédiatrie',
            ]),
            'doctor_verified_at' => null,
        ]);
    }
}
