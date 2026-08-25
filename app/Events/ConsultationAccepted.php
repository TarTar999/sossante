<?php

namespace App\Events;

use App\Models\ConsultationRequest;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ConsultationAccepted implements ShouldBroadcast
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
        return [
            new PrivateChannel('user.'.$this->consultation->patient_id),
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        $this->consultation->load('doctor');

        return [
            'id' => $this->consultation->id,
            'doctorName' => $this->consultation->doctor->name,
            'doctorSpecialization' => $this->consultation->doctor->profile?->doctor_specialization,
            'qrCode' => $this->consultation->qr_code,
            'status' => $this->consultation->status->value,
            'statusLabel' => $this->consultation->status->label(),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'consultation.accepted';
    }
}
