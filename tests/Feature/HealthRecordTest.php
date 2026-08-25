<?php

use App\Models\HealthRecord;
use App\Models\HealthRecordPage;
use App\Models\User;
use Illuminate\Support\Facades\URL;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertSoftDeleted;

beforeEach(function () {
    $this->user = User::factory()->create();
    URL::defaults(['current_team' => $this->user->currentTeam->slug]);
});

it('displays health records index page', function () {
    $records = HealthRecord::factory()->count(3)->for($this->user)->create();

    actingAs($this->user)
        ->get(route('health-records.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('health-records/index')
            ->has('records', 3)
        );
});

it('displays create health record form', function () {
    actingAs($this->user)
        ->get(route('health-records.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('health-records/create')
            ->has('relationships')
        );
});

it('can create a health record', function () {
    actingAs($this->user)
        ->post(route('health-records.store'), [
            'name' => 'Jean Dupont',
            'relationship' => 'self',
        ])
        ->assertRedirect();

    assertDatabaseHas('health_records', [
        'user_id' => $this->user->id,
        'name' => 'Jean Dupont',
        'relationship' => 'self',
    ]);
});

it('validates required fields when creating a health record', function () {
    actingAs($this->user)
        ->post(route('health-records.store'), [])
        ->assertSessionHasErrors(['name', 'relationship']);
});

it('displays health record show page', function () {
    $record = HealthRecord::factory()->for($this->user)->create();
    HealthRecordPage::factory()->count(2)->for($record)->create();

    actingAs($this->user)
        ->get(route('health-records.show', $record))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('health-records/show')
            ->has('record')
            ->has('pages', 2)
        );
});

it('cannot view another user\'s health record', function () {
    $otherUser = User::factory()->create();
    $record = HealthRecord::factory()->for($otherUser)->create();

    actingAs($this->user)
        ->get(route('health-records.show', $record))
        ->assertForbidden();
});

it('displays health record edit form', function () {
    $record = HealthRecord::factory()->for($this->user)->create();

    actingAs($this->user)
        ->get(route('health-records.edit', $record))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('health-records/edit')
            ->has('record')
            ->has('relationships')
        );
});

it('can update a health record', function () {
    $record = HealthRecord::factory()->for($this->user)->create([
        'name' => 'Old Name',
    ]);

    actingAs($this->user)
        ->put(route('health-records.update', $record), [
            'name' => 'New Name',
            'relationship' => 'child',
        ])
        ->assertRedirect();

    assertDatabaseHas('health_records', [
        'id' => $record->id,
        'name' => 'New Name',
        'relationship' => 'child',
    ]);
});

it('can delete a health record', function () {
    $record = HealthRecord::factory()->for($this->user)->create();

    actingAs($this->user)
        ->delete(route('health-records.destroy', $record))
        ->assertRedirect();

    assertSoftDeleted('health_records', ['id' => $record->id]);
});

it('cannot delete another user\'s health record', function () {
    $otherUser = User::factory()->create();
    $record = HealthRecord::factory()->for($otherUser)->create();

    actingAs($this->user)
        ->delete(route('health-records.destroy', $record))
        ->assertForbidden();
});
