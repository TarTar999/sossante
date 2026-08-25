<?php

namespace Database\Factories;

use App\Models\HealthRecord;
use App\Models\HealthRecordPage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HealthRecordPage>
 */
class HealthRecordPageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'health_record_id' => HealthRecord::factory(),
            'page_number' => fake()->numberBetween(1, 100),
            'image_path' => 'health-records/pages/'.fake()->uuid().'.jpg',
            'notes' => fake()->optional()->paragraph(),
            'scanned_at' => fake()->dateTimeBetween('-1 year', 'now'),
        ];
    }

    /**
     * Set a specific page number.
     */
    public function pageNumber(int $number): static
    {
        return $this->state(fn (array $attributes) => [
            'page_number' => $number,
        ]);
    }

    /**
     * Add notes to the page.
     */
    public function withNotes(?string $notes = null): static
    {
        return $this->state(fn (array $attributes) => [
            'notes' => $notes ?? fake()->paragraph(),
        ]);
    }
}
