<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Team;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DoctorVerificationController extends Controller
{
    /**
     * Display pending doctor verifications.
     */
    public function index(Request $request): Response
    {
        abort_unless($request->user()->isAdmin(), 403);

        $pendingDoctors = UserProfile::query()
            ->where('is_verified_doctor', false)
            ->whereNotNull('doctor_license_number')
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn (UserProfile $profile) => [
                'userId' => $profile->user_id,
                'name' => $profile->user->name,
                'email' => $profile->user->email,
                'licenseNumber' => $profile->doctor_license_number,
                'specialization' => $profile->doctor_specialization,
                'createdAt' => $profile->created_at->toISOString(),
            ]);

        return Inertia::render('admin/doctors/pending', [
            'pendingDoctors' => $pendingDoctors,
        ]);
    }

    /**
     * Verify a doctor.
     */
    public function verify(Request $request, Team $currentTeam, User $user): RedirectResponse
    {
        abort_unless($request->user()->isAdmin(), 403);

        $profile = $user->profile;

        abort_unless($profile && $profile->doctor_license_number, 404);

        $user->update(['role' => UserRole::Doctor]);
        $profile->update([
            'is_verified_doctor' => true,
            'doctor_verified_at' => now(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Médecin vérifié.']);

        return back();
    }

    /**
     * Reject a doctor verification.
     */
    public function reject(Request $request, Team $currentTeam, User $user): RedirectResponse
    {
        abort_unless($request->user()->isAdmin(), 403);

        $profile = $user->profile;

        if ($profile) {
            $profile->update([
                'doctor_license_number' => null,
                'doctor_specialization' => null,
            ]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Demande de vérification rejetée.']);

        return back();
    }
}
