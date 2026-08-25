<?php

namespace App\Enums;

enum ConsultationStatus: string
{
    case Pending = 'pending';
    case Accepted = 'accepted';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    /**
     * Get the display label for the status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Pending => 'En attente',
            self::Accepted => 'Acceptée',
            self::InProgress => 'En cours',
            self::Completed => 'Terminée',
            self::Cancelled => 'Annulée',
        };
    }

    /**
     * Get the color for the status (for UI badges).
     */
    public function color(): string
    {
        return match ($this) {
            self::Pending => 'yellow',
            self::Accepted => 'blue',
            self::InProgress => 'purple',
            self::Completed => 'green',
            self::Cancelled => 'gray',
        };
    }

    /**
     * Get the Tailwind CSS classes for the status badge.
     */
    public function badgeClasses(): string
    {
        return match ($this) {
            self::Pending => 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            self::Accepted => 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            self::InProgress => 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
            self::Completed => 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            self::Cancelled => 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
        };
    }

    /**
     * Check if the consultation is active (can be modified).
     */
    public function isActive(): bool
    {
        return in_array($this, [self::Pending, self::Accepted, self::InProgress]);
    }

    /**
     * Check if the consultation is finished (completed or cancelled).
     */
    public function isFinished(): bool
    {
        return in_array($this, [self::Completed, self::Cancelled]);
    }

    /**
     * Check if the consultation can be cancelled.
     */
    public function canBeCancelled(): bool
    {
        return in_array($this, [self::Pending, self::Accepted]);
    }
}
