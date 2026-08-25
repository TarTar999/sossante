<?php

namespace App\Http\Controllers\HealthRecords;

use App\Enums\RecordRelationship;
use App\Http\Controllers\Controller;
use App\Http\Requests\HealthRecords\StoreHealthRecordRequest;
use App\Http\Requests\HealthRecords\UpdateHealthRecordRequest;
use App\Models\HealthRecord;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class HealthRecordController extends Controller
{
    /**
     * Display a listing of the user's health records.
     */
    public function index(Request $request): Response
    {
        $records = $request->user()
            ->healthRecords()
            ->withCount('pages')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (HealthRecord $record) => [
                'id' => $record->id,
                'name' => $record->name,
                'coverPhotoUrl' => $record->cover_photo_url,
                'dateOfBirth' => $record->date_of_birth?->format('Y-m-d'),
                'relationship' => $record->relationship->value,
                'relationshipLabel' => $record->relationship->label(),
                'pagesCount' => $record->pages_count,
                'createdAt' => $record->created_at->toISOString(),
            ]);

        return Inertia::render('health-records/index', [
            'records' => $records,
            'relationships' => RecordRelationship::options(),
        ]);
    }

    /**
     * Show the form for creating a new health record.
     */
    public function create(): Response
    {
        return Inertia::render('health-records/create', [
            'relationships' => RecordRelationship::options(),
        ]);
    }

    /**
     * Store a newly created health record.
     */
    public function store(StoreHealthRecordRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('cover_photo')) {
            $data['cover_photo'] = $request->file('cover_photo')
                ->store('health-records/covers', 'public');
        }

        $record = $request->user()->healthRecords()->create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Carnet de santé créé.']);

        return to_route('health-records.show', $record);
    }

    /**
     * Display the specified health record with its pages.
     */
    public function show(Request $request, Team $currentTeam, HealthRecord $healthRecord): Response
    {
        abort_unless($healthRecord->user_id === $request->user()->id, 403);

        $healthRecord->load('pages');

        return Inertia::render('health-records/show', [
            'record' => [
                'id' => $healthRecord->id,
                'name' => $healthRecord->name,
                'coverPhotoUrl' => $healthRecord->cover_photo_url,
                'dateOfBirth' => $healthRecord->date_of_birth?->format('Y-m-d'),
                'relationship' => $healthRecord->relationship->value,
                'relationshipLabel' => $healthRecord->relationship->label(),
                'createdAt' => $healthRecord->created_at->toISOString(),
            ],
            'pages' => $healthRecord->pages->map(fn ($page) => [
                'id' => $page->id,
                'pageNumber' => $page->page_number,
                'imageUrl' => $page->image_url,
                'notes' => $page->notes,
                'scannedAt' => $page->scanned_at?->toISOString(),
            ]),
        ]);
    }

    /**
     * Show the form for editing the specified health record.
     */
    public function edit(Request $request, Team $currentTeam, HealthRecord $healthRecord): Response
    {
        abort_unless($healthRecord->user_id === $request->user()->id, 403);

        return Inertia::render('health-records/edit', [
            'record' => [
                'id' => $healthRecord->id,
                'name' => $healthRecord->name,
                'coverPhotoUrl' => $healthRecord->cover_photo_url,
                'dateOfBirth' => $healthRecord->date_of_birth?->format('Y-m-d'),
                'relationship' => $healthRecord->relationship->value,
            ],
            'relationships' => RecordRelationship::options(),
        ]);
    }

    /**
     * Update the specified health record.
     */
    public function update(UpdateHealthRecordRequest $request, Team $currentTeam, HealthRecord $healthRecord): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('cover_photo')) {
            // Delete old cover photo if exists
            if ($healthRecord->cover_photo) {
                Storage::disk('public')->delete($healthRecord->cover_photo);
            }

            $data['cover_photo'] = $request->file('cover_photo')
                ->store('health-records/covers', 'public');
        }

        $healthRecord->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Carnet de santé mis à jour.']);

        return to_route('health-records.show', $healthRecord);
    }

    /**
     * Remove the specified health record.
     */
    public function destroy(Request $request, Team $currentTeam, HealthRecord $healthRecord): RedirectResponse
    {
        abort_unless($healthRecord->user_id === $request->user()->id, 403);

        // Delete cover photo
        if ($healthRecord->cover_photo) {
            Storage::disk('public')->delete($healthRecord->cover_photo);
        }

        // Delete all page images
        foreach ($healthRecord->pages as $page) {
            Storage::disk('public')->delete($page->image_path);
        }

        $healthRecord->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Carnet de santé supprimé.']);

        return to_route('health-records.index');
    }
}
