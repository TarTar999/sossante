<?php

namespace App\Enums;

enum RecordRelationship: string
{
    case Self = 'self';
    case Child = 'child';
    case Spouse = 'spouse';
    case Parent = 'parent';
    case Sibling = 'sibling';
    case Other = 'other';

    /**
     * Get the display label for the relationship.
     */
    public function label(): string
    {
        return match ($this) {
            self::Self => 'Moi-même',
            self::Child => 'Enfant',
            self::Spouse => 'Conjoint(e)',
            self::Parent => 'Parent',
            self::Sibling => 'Frère/Sœur',
            self::Other => 'Autre',
        };
    }

    /**
     * Get the icon name for the relationship (Lucide icons).
     */
    public function icon(): string
    {
        return match ($this) {
            self::Self => 'user',
            self::Child => 'baby',
            self::Spouse => 'heart',
            self::Parent => 'users',
            self::Sibling => 'users',
            self::Other => 'user-plus',
        };
    }

    /**
     * Get all relationship options for selection.
     *
     * @return array<array{value: string, label: string, icon: string}>
     */
    public static function options(): array
    {
        return collect(self::cases())
            ->map(fn (self $relationship) => [
                'value' => $relationship->value,
                'label' => $relationship->label(),
                'icon' => $relationship->icon(),
            ])
            ->toArray();
    }
}
