<?php

use App\Enums\ConsultationStatus;
use App\Enums\UserRole;
use App\Models\ConsultationRequest;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Support\Facades\URL;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;

beforeEach(function () {
    $this->patient = User::factory()->create();
    $this->doctor = User::factory()->create([
        'role' => UserRole::Doctor,
    ]);
    UserProfile::factory()->verifiedDoctor()->for($this->doctor, 'user')->create();
});

it('displays consultation index page for patient', function () {
    $consultations = ConsultationRequest::factory()
        ->count(3)
        ->for($this->patient, 'patient')
        ->create();

    URL::defaults(['current_team' => $this->patient->currentTeam->slug]);

    actingAs($this->patient)
        ->get(route('consultations.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('consultations/index')
            ->has('consultations', 3)
        );
});

it('displays create consultation form', function () {
    URL::defaults(['current_team' => $this->patient->currentTeam->slug]);

    actingAs($this->patient)
        ->get(route('consultations.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('consultations/create')
            ->has('urgencyOptions')
        );
});

it('can create a consultation request', function () {
    URL::defaults(['current_team' => $this->patient->currentTeam->slug]);

    actingAs($this->patient)
        ->post(route('consultations.store'), [
            'urgency' => 'standard',
            'symptoms' => 'I have a headache and fever.',
        ])
        ->assertRedirect();

    assertDatabaseHas('consultation_requests', [
        'patient_id' => $this->patient->id,
        'urgency' => 'standard',
        'symptoms' => 'I have a headache and fever.',
        'status' => ConsultationStatus::Pending->value,
    ]);
});

it('validates required fields when creating a consultation', function () {
    URL::defaults(['current_team' => $this->patient->currentTeam->slug]);

    actingAs($this->patient)
        ->post(route('consultations.store'), [])
        ->assertSessionHasErrors(['urgency', 'symptoms']);
});

it('displays consultation show page', function () {
    $consultation = ConsultationRequest::factory()
        ->for($this->patient, 'patient')
        ->create();

    URL::defaults(['current_team' => $this->patient->currentTeam->slug]);

    actingAs($this->patient)
        ->get(route('consultations.show', $consultation))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('consultations/show')
            ->has('consultation')
        );
});

it('cannot view another patient\'s consultation', function () {
    $otherPatient = User::factory()->create();
    $consultation = ConsultationRequest::factory()
        ->for($otherPatient, 'patient')
        ->create();

    URL::defaults(['current_team' => $this->patient->currentTeam->slug]);

    actingAs($this->patient)
        ->get(route('consultations.show', $consultation))
        ->assertForbidden();
});

it('can cancel a pending consultation', function () {
    $consultation = ConsultationRequest::factory()
        ->for($this->patient, 'patient')
        ->create();

    URL::defaults(['current_team' => $this->patient->currentTeam->slug]);

    actingAs($this->patient)
        ->delete(route('consultations.destroy', $consultation))
        ->assertRedirect();

    expect($consultation->fresh()->status)->toBe(ConsultationStatus::Cancelled);
});

it('cannot cancel an in-progress consultation', function () {
    $consultation = ConsultationRequest::factory()
        ->for($this->patient, 'patient')
        ->inProgress($this->doctor)
        ->create();

    URL::defaults(['current_team' => $this->patient->currentTeam->slug]);

    actingAs($this->patient)
        ->delete(route('consultations.destroy', $consultation))
        ->assertForbidden();
});

// Doctor tests
it('displays doctor consultations dashboard', function () {
    ConsultationRequest::factory()->count(2)->create(); // pending
    ConsultationRequest::factory()
        ->accepted($this->doctor)
        ->create();

    URL::defaults(['current_team' => $this->doctor->currentTeam->slug]);

    actingAs($this->doctor)
        ->get(route('doctor.consultations.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('doctor/consultations/index')
            ->has('pendingConsultations', 2)
            ->has('activeConsultations', 1)
        );
});

it('doctor can accept a consultation', function () {
    $consultation = ConsultationRequest::factory()->create();

    URL::defaults(['current_team' => $this->doctor->currentTeam->slug]);

    actingAs($this->doctor)
        ->post(route('doctor.consultations.accept', $consultation))
        ->assertRedirect();

    expect($consultation->fresh())
        ->doctor_id->toBe($this->doctor->id)
        ->status->toBe(ConsultationStatus::Accepted);
});

it('doctor cannot accept already accepted consultation', function () {
    $otherDoctor = User::factory()->create(['role' => UserRole::Doctor]);
    UserProfile::factory()->verifiedDoctor()->for($otherDoctor, 'user')->create();

    $consultation = ConsultationRequest::factory()
        ->accepted($otherDoctor)
        ->create();

    URL::defaults(['current_team' => $this->doctor->currentTeam->slug]);

    actingAs($this->doctor)
        ->post(route('doctor.consultations.accept', $consultation))
        ->assertForbidden();
});

it('doctor can view accepted consultation', function () {
    $consultation = ConsultationRequest::factory()
        ->accepted($this->doctor)
        ->create();

    URL::defaults(['current_team' => $this->doctor->currentTeam->slug]);

    actingAs($this->doctor)
        ->get(route('doctor.consultations.show', $consultation))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('doctor/consultations/show')
            ->has('consultation')
            ->has('patient')
        );
});

it('doctor can scan QR code and start consultation', function () {
    $consultation = ConsultationRequest::factory()
        ->accepted($this->doctor)
        ->create();

    URL::defaults(['current_team' => $this->doctor->currentTeam->slug]);

    actingAs($this->doctor)
        ->post(route('doctor.consultations.scan', $consultation), [
            'qr_code' => $consultation->qr_code,
        ])
        ->assertRedirect();

    expect($consultation->fresh())
        ->status->toBe(ConsultationStatus::InProgress)
        ->qr_scanned_at->not->toBeNull()
        ->consultation_started_at->not->toBeNull();
});

it('doctor cannot start consultation with wrong QR code', function () {
    $consultation = ConsultationRequest::factory()
        ->accepted($this->doctor)
        ->create();

    URL::defaults(['current_team' => $this->doctor->currentTeam->slug]);

    actingAs($this->doctor)
        ->post(route('doctor.consultations.scan', $consultation), [
            'qr_code' => 'wrong-qr-code',
        ])
        ->assertRedirect();

    expect($consultation->fresh()->status)->toBe(ConsultationStatus::Accepted);
});

it('doctor can complete consultation', function () {
    $consultation = ConsultationRequest::factory()
        ->inProgress($this->doctor)
        ->create();

    URL::defaults(['current_team' => $this->doctor->currentTeam->slug]);

    actingAs($this->doctor)
        ->post(route('doctor.consultations.complete', $consultation), [
            'notes' => 'Patient needs rest.',
        ])
        ->assertRedirect();

    expect($consultation->fresh())
        ->status->toBe(ConsultationStatus::Completed)
        ->notes->toBe('Patient needs rest.')
        ->consultation_ended_at->not->toBeNull();
});

it('unverified doctor cannot access doctor routes', function () {
    $unverifiedDoctor = User::factory()->create(['role' => UserRole::Doctor]);

    URL::defaults(['current_team' => $unverifiedDoctor->currentTeam->slug]);

    actingAs($unverifiedDoctor)
        ->get(route('doctor.consultations.index'))
        ->assertForbidden();
});
