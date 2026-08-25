<?php

use App\Enums\BloodType;
use App\Enums\UserRole;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Support\Facades\URL;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->doctor = User::factory()->create([
        'role' => UserRole::Doctor,
    ]);
    UserProfile::factory()->verifiedDoctor()->for($this->doctor, 'user')->create();
});

it('displays CNI search page', function () {
    URL::defaults(['current_team' => $this->user->currentTeam->slug]);

    actingAs($this->user)
        ->get(route('search.cni'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('search/cni')
            ->where('result', null)
        );
});

it('shows basic info for regular user when CNI found', function () {
    $target = User::factory()->create(['name' => 'Jean Target']);
    $profile = UserProfile::factory()->for($target, 'user')->create([
        'cni' => 'CNI123456',
        'emergency_contact_name' => 'Marie Emergency',
        'emergency_contact_phone' => '0600000000',
        'blood_type' => BloodType::OPositive,
        'allergies' => 'Penicillin',
    ]);

    URL::defaults(['current_team' => $this->user->currentTeam->slug]);

    actingAs($this->user)
        ->post(route('search.cni.search'), ['cni' => 'CNI123456'])
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('search/cni')
            ->has('result', fn ($result) => $result
                ->where('name', 'Jean Target')
                ->where('emergencyContactName', 'Marie Emergency')
                ->where('emergencyContactPhone', '0600000000')
                ->missing('bloodType')
                ->missing('allergies')
            )
            ->where('isDoctor', false)
        );
});

it('shows full medical info for verified doctor when CNI found', function () {
    $target = User::factory()->create(['name' => 'Jean Target']);
    $profile = UserProfile::factory()->for($target, 'user')->create([
        'cni' => 'CNI123456',
        'emergency_contact_name' => 'Marie Emergency',
        'emergency_contact_phone' => '0600000000',
        'blood_type' => BloodType::OPositive,
        'allergies' => 'Penicillin',
        'chronic_conditions' => 'Diabetes',
        'phone' => '0611111111',
        'address' => '123 Main Street',
    ]);

    URL::defaults(['current_team' => $this->doctor->currentTeam->slug]);

    actingAs($this->doctor)
        ->post(route('search.cni.search'), ['cni' => 'CNI123456'])
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('search/cni')
            ->has('result', fn ($result) => $result
                ->where('name', 'Jean Target')
                ->where('emergencyContactName', 'Marie Emergency')
                ->where('emergencyContactPhone', '0600000000')
                ->where('bloodType', 'O+')
                ->where('allergies', 'Penicillin')
                ->where('chronicConditions', 'Diabetes')
                ->where('phone', '0611111111')
                ->where('address', '123 Main Street')
                ->has('dateOfBirth')
            )
            ->where('isDoctor', true)
        );
});

it('shows not found when CNI does not exist', function () {
    URL::defaults(['current_team' => $this->user->currentTeam->slug]);

    actingAs($this->user)
        ->post(route('search.cni.search'), ['cni' => 'NONEXISTENT'])
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('search/cni')
            ->where('result', null)
            ->where('notFound', true)
            ->where('searchedCni', 'NONEXISTENT')
        );
});

it('validates CNI is required', function () {
    URL::defaults(['current_team' => $this->user->currentTeam->slug]);

    actingAs($this->user)
        ->post(route('search.cni.search'), [])
        ->assertSessionHasErrors(['cni']);
});

it('validates CNI is a string', function () {
    URL::defaults(['current_team' => $this->user->currentTeam->slug]);

    actingAs($this->user)
        ->post(route('search.cni.search'), ['cni' => ['array']])
        ->assertSessionHasErrors(['cni']);
});
