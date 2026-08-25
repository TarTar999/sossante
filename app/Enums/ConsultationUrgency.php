<?php

namespace App\Enums;

enum ConsultationUrgency: string
{
    case Standard = 'standard';
    case Urgent = 'urgent';
    case VeryUrgent = 'very_urgent';

    /**
     * Get the display label for the urgency level.
     */
    public function label(): string
    {
        return match ($this) {
            self::Standard => 'Standard',
            self::Urgent => 'Urgent',
            self::VeryUrgent => 'Très Urgent',
        };
    }

    /**
     * Get the color for the urgency level (for UI badges).
     */
    public function color(): string
    {
        return match ($this) {
            self::Standard => 'green',
            self::Urgent => 'orange',
            self::VeryUrgent => 'red',
        };
    }

    /**
     * Get the Tailwind CSS classes for the urgency badge.
     */
    public function badgeClasses(): string
    {
        return match ($this) {
            self::Standard => 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            self::Urgent => 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
            self::VeryUrgent => 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        };
    }

    /**
     * Get the priority level (higher = more urgent).
     */
    public function priority(): int
    {
        return match ($this) {
            self::Standard => 1,
            self::Urgent => 2,
            self::VeryUrgent => 3,
        };
    }

    /**
     * Get all urgency options for selection.
     *
     * @return array<array{value: string, label: string, color: string}>
     */
    public static function options(): array
    {
        return collect(self::cases())
            ->map(fn (self $urgency) => [
                'value' => $urgency->value,
                'label' => $urgency->label(),
                'color' => $urgency->color(),
            ])
            ->toArray();
    }
}
