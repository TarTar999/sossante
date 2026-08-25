<?php

namespace App\Events;

use App\Models\ConsultationRequest;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ConsultationStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public ConsultationRequest $consultation
    ) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel('user.'.$this->consultation->patient_id),
        ];

        if ($this->consultation->doctor_id) {
            $channels[] = new PrivateChannel('user.'.$this->consultation->doctor_id);
        }

        return $channels;
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->consultation->id,
            'status' => $this->consultation->status->value,
            'statusLabel' => $this->consultation->status->label(),
            'qrScannedAt' => $this->consultation->qr_scanned_at?->toISOString(),
            'consultationStartedAt' => $this->consultation->consultation_started_at?->toISOString(),
            'consultationEndedAt' => $this->consultation->consultation_ended_at?->toISOString(),
            'durationMinutes' => $this->consultation->getDurationInMinutes(),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'consultation.status-changed';
    }
}
