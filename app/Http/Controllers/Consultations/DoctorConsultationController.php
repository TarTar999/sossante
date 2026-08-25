<?php

namespace App\Http\Controllers\Consultations;

use App\Enums\ConsultationStatus;
use App\Events\ConsultationAccepted;
use App\Events\ConsultationStatusChanged;
use App\Http\Controllers\Controller;
use App\Models\ConsultationRequest;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DoctorConsultationController extends Controller
{
    /**
     * Display pending consultation requests for doctors.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        abort_unless($user->isVerifiedDoctor(), 403);

        $pending = ConsultationRequest::query()
            ->pending()
            ->orderByUrgency()
            ->orderBy('created_at', 'asc')
            ->with('patient')
            ->get()
            ->map(fn (ConsultationRequest $consultation) => [
                'id' => $consultation->id,
                'patientName' => $consultation->patient->name,
                'urgency' => $consultation->urgency->value,
                'urgencyLabel' => $consultation->urgency->label(),
                'urgencyColor' => $consultation->urgency->color(),
                'urgencyBadgeClasses' => $consultation->urgency->badgeClasses(),
                'symptoms' => $consultation->symptoms,
                'createdAt' => $consultation->created_at->toISOString(),
                'waitingTime' => $consultation->created_at->diffForHumans(),
            ]);

        $active = $user->consultationRequestsAsDoctor()
            ->active()
            ->with('patient')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (ConsultationRequest $consultation) => [
                'id' => $consultation->id,
                'patientName' => $consultation->patient->name,
                'urgency' => $consultation->urgency->value,
                'urgencyLabel' => $consultation->urgency->label(),
                'status' => $consultation->status->value,
                'statusLabel' => $consultation->status->label(),
                'symptoms' => $consultation->symptoms,
                'qrCode' => $consultation->qr_code,
                'qrScanned' => $consultation->qr_scanned_at !== null,
                'createdAt' => $consultation->created_at->toISOString(),
            ]);

        return Inertia::render('doctor/consultations/index', [
            'pendingConsultations' => $pending,
            'activeConsultations' => $active,
        ]);
    }

    /**
     * Accept a consultation request.
     */
    public function accept(Request $request, Team $currentTeam, ConsultationRequest $consultation): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user->isVerifiedDoctor(), 403);
        abort_unless($consultation->canBeAccepted(), 403);

        $success = DB::transaction(function () use ($user, $consultation) {
            // Lock the row to prevent race conditions
            $consultation = ConsultationRequest::whereKey($consultation->id)
                ->where('status', ConsultationStatus::Pending)
                ->whereNull('doctor_id')
                ->lockForUpdate()
                ->first();

            if (! $consultation) {
                return false;
            }

            $consultation->accept($user);

            return true;
        });

        if (! $success) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Cette consultation a déjà été acceptée par un autre médecin.']);

            return to_route('doctor.consultations.index');
        }

        // Notify the patient
        event(new ConsultationAccepted($consultation->fresh()));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Consultation acceptée.']);

        return to_route('doctor.consultations.show', $consultation);
    }

    /**
     * Display a specific consultation for the doctor.
     */
    public function show(Request $request, Team $currentTeam, ConsultationRequest $consultation): Response
    {
        $user = $request->user();

        abort_unless($user->isVerifiedDoctor(), 403);
        abort_unless($consultation->doctor_id === $user->id, 403);

        $consultation->load(['patient', 'patient.profile']);

        return Inertia::render('doctor/consultations/show', [
            'consultation' => [
                'id' => $consultation->id,
                'urgency' => $consultation->urgency->value,
                'urgencyLabel' => $consultation->urgency->label(),
                'urgencyColor' => $consultation->urgency->color(),
                'status' => $consultation->status->value,
                'statusLabel' => $consultation->status->label(),
                'symptoms' => $consultation->symptoms,
                'qrCode' => $consultation->qr_code,
                'qrScanned' => $consultation->qr_scanned_at !== null,
                'qrScannedAt' => $consultation->qr_scanned_at?->toISOString(),
                'consultationStartedAt' => $consultation->consultation_started_at?->toISOString(),
                'consultationEndedAt' => $consultation->consultation_ended_at?->toISOString(),
                'durationMinutes' => $consultation->getDurationInMinutes(),
                'notes' => $consultation->notes,
                'createdAt' => $consultation->created_at->toISOString(),
                'canBeStarted' => $consultation->canBeStarted(),
                'canBeCompleted' => $consultation->canBeCompleted(),
            ],
            'patient' => [
                'name' => $consultation->patient->name,
                'email' => $consultation->patient->email,
                'phone' => $consultation->patient->profile?->phone,
                'dateOfBirth' => $consultation->patient->profile?->date_of_birth?->format('Y-m-d'),
                'bloodType' => $consultation->patient->profile?->blood_type?->value,
                'allergies' => $consultation->patient->profile?->allergies,
                'chronicConditions' => $consultation->patient->profile?->chronic_conditions,
                'emergencyContactName' => $consultation->patient->profile?->emergency_contact_name,
                'emergencyContactPhone' => $consultation->patient->profile?->emergency_contact_phone,
            ],
        ]);
    }

    /**
     * Scan QR code and start the consultation.
     */
    public function scan(Request $request, Team $currentTeam, ConsultationRequest $consultation): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user->isVerifiedDoctor(), 403);
        abort_unless($consultation->doctor_id === $user->id, 403);
        abort_unless($consultation->canBeStarted(), 403);

        $request->validate([
            'qr_code' => ['required', 'string'],
        ]);

        if ($request->input('qr_code') !== $consultation->qr_code) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'QR Code invalide.']);

            return back();
        }

        $consultation->start();

        event(new ConsultationStatusChanged($consultation));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Consultation démarrée.']);

        return to_route('doctor.consultations.show', $consultation);
    }

    /**
     * Complete the consultation.
     */
    public function complete(Request $request, Team $currentTeam, ConsultationRequest $consultation): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user->isVerifiedDoctor(), 403);
        abort_unless($consultation->doctor_id === $user->id, 403);
        abort_unless($consultation->canBeCompleted(), 403);

        $request->validate([
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $consultation->complete($request->input('notes'));

        event(new ConsultationStatusChanged($consultation));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Consultation terminée.']);

        return to_route('doctor.consultations.index');
    }
}
