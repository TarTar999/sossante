<?php

namespace App\Http\Controllers\Search;

use App\Http\Controllers\Controller;
use App\Http\Requests\Search\CniSearchRequest;
use App\Models\UserProfile;
use Inertia\Inertia;
use Inertia\Response;

class CniSearchController extends Controller
{
    /**
     * Display the CNI search page.
     */
    public function index(): Response
    {
        return Inertia::render('search/cni', [
            'result' => null,
        ]);
    }

    /**
     * Search for a user by CNI.
     */
    public function search(CniSearchRequest $request): Response
    {
        $cni = $request->validated('cni');
        $user = $request->user();

        $profile = UserProfile::where('cni', $cni)->first();

        if (! $profile) {
            return Inertia::render('search/cni', [
                'result' => null,
                'notFound' => true,
                'searchedCni' => $cni,
            ]);
        }

        // Basic info visible to everyone
        $result = [
            'name' => $profile->user->name,
            'emergencyContactName' => $profile->emergency_contact_name,
            'emergencyContactPhone' => $profile->emergency_contact_phone,
        ];

        // If the searcher is a verified doctor, show medical info
        if ($user->isVerifiedDoctor()) {
            $result = array_merge($result, [
                'dateOfBirth' => $profile->date_of_birth?->format('Y-m-d'),
                'bloodType' => $profile->blood_type?->value,
                'allergies' => $profile->allergies,
                'chronicConditions' => $profile->chronic_conditions,
                'phone' => $profile->phone,
                'address' => $profile->address,
            ]);
        }

        return Inertia::render('search/cni', [
            'result' => $result,
            'searchedCni' => $cni,
            'isDoctor' => $user->isVerifiedDoctor(),
        ]);
    }
}
