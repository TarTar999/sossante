<?php

namespace App\Enums;

enum BloodType: string
{
    case APositive = 'A+';
    case ANegative = 'A-';
    case BPositive = 'B+';
    case BNegative = 'B-';
    case ABPositive = 'AB+';
    case ABNegative = 'AB-';
    case OPositive = 'O+';
    case ONegative = 'O-';

    /**
     * Get the display label for the blood type.
     */
    public function label(): string
    {
        return $this->value;
    }

    /**
     * Get all blood type options for selection.
     *
     * @return array<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return collect(self::cases())
            ->map(fn (self $type) => [
                'value' => $type->value,
                'label' => $type->label(),
            ])
            ->toArray();
    }

    /**
     * Check if this blood type can donate to another blood type.
     */
    public function canDonateTo(BloodType $recipient): bool
    {
        $compatibility = [
            'O-' => ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
            'O+' => ['A+', 'B+', 'AB+', 'O+'],
            'A-' => ['A+', 'A-', 'AB+', 'AB-'],
            'A+' => ['A+', 'AB+'],
            'B-' => ['B+', 'B-', 'AB+', 'AB-'],
            'B+' => ['B+', 'AB+'],
            'AB-' => ['AB+', 'AB-'],
            'AB+' => ['AB+'],
        ];

        return in_array($recipient->value, $compatibility[$this->value] ?? []);
    }

    /**
     * Check if this blood type can receive from another blood type.
     */
    public function canReceiveFrom(BloodType $donor): bool
    {
        return $donor->canDonateTo($this);
    }
}
