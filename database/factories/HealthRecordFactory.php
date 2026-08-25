<?php

namespace Database\Factories;

use App\Enums\RecordRelationship;
use App\Models\HealthRecord;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HealthRecord>
 */
class HealthRecordFactory extends Factory
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
            'name' => fake()->name(),
            'cover_photo' => null,
            'date_of_birth' => fake()->dateTimeBetween('-80 years', 'now'),
            'relationship' => fake()->randomElement(RecordRelationship::cases()),
        ];
    }

    /**
     * Indicate that the record is for the user themselves.
     */
    public function forSelf(): static
    {
        return $this->state(fn (array $attributes) => [
            'relationship' => RecordRelationship::Self,
        ]);
    }

    /**
     * Indicate that the record is for a child.
     */
    public function forChild(): static
    {
        return $this->state(fn (array $attributes) => [
            'relationship' => RecordRelationship::Child,
            'date_of_birth' => fake()->dateTimeBetween('-18 years', 'now'),
        ]);
    }

    /**
     * Indicate that the record has a cover photo.
     */
    public function withCoverPhoto(): static
    {
        return $this->state(fn (array $attributes) => [
            'cover_photo' => 'health-records/covers/'.fake()->uuid().'.jpg',
        ]);
    }
}
