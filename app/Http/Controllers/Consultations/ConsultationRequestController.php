<?php

namespace App\Http\Controllers\Consultations;

use App\Enums\ConsultationStatus;
use App\Enums\ConsultationUrgency;
use App\Events\ConsultationRequestCreated;
use App\Http\Controllers\Controller;
use App\Http\Requests\Consultations\StoreConsultationRequest;
use App\Models\ConsultationRequest;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConsultationRequestController extends Controller
{
    /**
     * Display a listing of the user's consultation requests.
     */
    public function index(Request $request): Response
    {
        $consultations = $request->user()
            ->consultationRequestsAsPatient()
            ->with('doctor')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (ConsultationRequest $consultation) => [
                'id' => $consultation->id,
                'urgency' => $consultation->urgency->value,
                'urgencyLabel' => $consultation->urgency->label(),
                'urgencyColor' => $consultation->urgency->color(),
                'status' => $consultation->status->value,
                'statusLabel' => $consultation->status->label(),
                'statusColor' => $consultation->status->color(),
                'symptoms' => $consultation->symptoms,
                'doctorName' => $consultation->doctor?->name,
                'qrCode' => $consultation->qr_code,
                'createdAt' => $consultation->created_at->toISOString(),
                'canBeCancelled' => $consultation->canBeCancelled(),
            ]);

        return Inertia::render('consultations/index', [
            'consultations' => $consultations,
        ]);
    }

    /**
     * Show the form for creating a new consultation request.
     */
    public function create(): Response
    {
        return Inertia::render('consultations/create', [
            'urgencyOptions' => ConsultationUrgency::options(),
        ]);
    }

    /**
     * Store a newly created consultation request.
     */
    public function store(StoreConsultationRequest $request): RedirectResponse
    {
        $consultation = $request->user()->consultationRequestsAsPatient()->create([
            'urgency' => $request->validated('urgency'),
            'symptoms' => $request->validated('symptoms'),
            'status' => ConsultationStatus::Pending,
        ]);

        // Broadcast to all doctors
        event(new ConsultationRequestCreated($consultation));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Demande de consultation envoyée.']);

        return to_route('consultations.show', $consultation);
    }

    /**
     * Display the specified consultation request.
     */
    public function show(Request $request, Team $currentTeam, ConsultationRequest $consultation): Response
    {
        abort_unless($consultation->patient_id === $request->user()->id, 403);

        $consultation->load('doctor');

        return Inertia::render('consultations/show', [
            'consultation' => [
                'id' => $consultation->id,
                'urgency' => $consultation->urgency->value,
                'urgencyLabel' => $consultation->urgency->label(),
                'urgencyColor' => $consultation->urgency->color(),
                'status' => $consultation->status->value,
                'statusLabel' => $consultation->status->label(),
                'statusColor' => $consultation->status->color(),
                'symptoms' => $consultation->symptoms,
                'doctorName' => $consultation->doctor?->name,
                'doctorSpecialization' => $consultation->doctor?->profile?->doctor_specialization,
                'qrCode' => $consultation->qr_code,
                'qrScannedAt' => $consultation->qr_scanned_at?->toISOString(),
                'consultationStartedAt' => $consultation->consultation_started_at?->toISOString(),
                'consultationEndedAt' => $consultation->consultation_ended_at?->toISOString(),
                'durationMinutes' => $consultation->getDurationInMinutes(),
                'notes' => $consultation->notes,
                'createdAt' => $consultation->created_at->toISOString(),
                'canBeCancelled' => $consultation->canBeCancelled(),
            ],
        ]);
    }

    /**
     * Cancel the specified consultation request.
     */
    public function destroy(Request $request, Team $currentTeam, ConsultationRequest $consultation): RedirectResponse
    {
        abort_unless($consultation->patient_id === $request->user()->id, 403);
        abort_unless($consultation->canBeCancelled(), 403);

        $consultation->cancel();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Demande de consultation annulée.']);

        return to_route('consultations.index');
    }
}
