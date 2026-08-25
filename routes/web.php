<?php

use App\Http\Controllers\Admin\DoctorVerificationController;
use App\Http\Controllers\Consultations\ConsultationRequestController;
use App\Http\Controllers\Consultations\DoctorConsultationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HealthRecords\HealthRecordController;
use App\Http\Controllers\HealthRecords\HealthRecordPageController;
use App\Http\Controllers\Search\CniSearchController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');

        // Health Records
        Route::resource('health-records', HealthRecordController::class);
        Route::get('health-records/{health_record}/pages/create', [HealthRecordPageController::class, 'create'])
            ->name('health-records.pages.create');
        Route::post('health-records/{health_record}/pages', [HealthRecordPageController::class, 'store'])
            ->name('health-records.pages.store');
        Route::get('pages/{page}', [HealthRecordPageController::class, 'show'])
            ->name('pages.show');
        Route::patch('pages/{page}', [HealthRecordPageController::class, 'update'])
            ->name('pages.update');
        Route::delete('pages/{page}', [HealthRecordPageController::class, 'destroy'])
            ->name('pages.destroy');

        // Consultation Requests (Patient)
        Route::resource('consultations', ConsultationRequestController::class)
            ->only(['index', 'create', 'store', 'show', 'destroy']);

        // Doctor Consultations
        Route::middleware(['verified.doctor'])->prefix('doctor')->name('doctor.')->group(function () {
            Route::get('consultations', [DoctorConsultationController::class, 'index'])
                ->name('consultations.index');
            Route::post('consultations/{consultation}/accept', [DoctorConsultationController::class, 'accept'])
                ->name('consultations.accept');
            Route::get('consultations/{consultation}', [DoctorConsultationController::class, 'show'])
                ->name('consultations.show');
            Route::post('consultations/{consultation}/scan', [DoctorConsultationController::class, 'scan'])
                ->name('consultations.scan');
            Route::post('consultations/{consultation}/complete', [DoctorConsultationController::class, 'complete'])
                ->name('consultations.complete');
        });

        // CNI Search
        Route::get('search/cni', [CniSearchController::class, 'index'])->name('search.cni');
        Route::post('search/cni', [CniSearchController::class, 'search'])->name('search.cni.search');

        // Admin Routes
        Route::middleware(['admin'])->prefix('admin')->name('admin.')->group(function () {
            Route::get('doctors/pending', [DoctorVerificationController::class, 'index'])
                ->name('doctors.pending');
            Route::post('doctors/{user}/verify', [DoctorVerificationController::class, 'verify'])
                ->name('doctors.verify');
            Route::post('doctors/{user}/reject', [DoctorVerificationController::class, 'reject'])
                ->name('doctors.reject');
        });
    });

Route::middleware(['auth'])->group(function () {
    Route::post('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

require __DIR__.'/settings.php';
