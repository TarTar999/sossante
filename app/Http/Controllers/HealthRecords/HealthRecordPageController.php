<?php

namespace App\Http\Controllers\HealthRecords;

use App\Http\Controllers\Controller;
use App\Http\Requests\HealthRecords\StoreHealthRecordPageRequest;
use App\Models\HealthRecord;
use App\Models\HealthRecordPage;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class HealthRecordPageController extends Controller
{
    /**
     * Show the form for adding a new page.
     */
    public function create(Request $request, Team $currentTeam, HealthRecord $healthRecord): Response
    {
        abort_unless($healthRecord->user_id === $request->user()->id, 403);

        return Inertia::render('health-records/pages/create', [
            'record' => [
                'id' => $healthRecord->id,
                'name' => $healthRecord->name,
            ],
            'nextPageNumber' => $healthRecord->getNextPageNumber(),
        ]);
    }

    /**
     * Store a newly created page.
     */
    public function store(StoreHealthRecordPageRequest $request, Team $currentTeam, HealthRecord $healthRecord): RedirectResponse
    {
        $imagePath = $request->file('image')
            ->store('health-records/pages', 'public');

        $healthRecord->pages()->create([
            'page_number' => $healthRecord->getNextPageNumber(),
            'image_path' => $imagePath,
            'notes' => $request->validated('notes'),
            'scanned_at' => now(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Page ajoutée.']);

        return to_route('health-records.show', $healthRecord);
    }

    /**
     * Display the specified page.
     */
    public function show(Request $request, Team $currentTeam, HealthRecordPage $page): Response
    {
        abort_unless($page->healthRecord->user_id === $request->user()->id, 403);

        return Inertia::render('health-records/pages/show', [
            'page' => [
                'id' => $page->id,
                'pageNumber' => $page->page_number,
                'imageUrl' => $page->image_url,
                'notes' => $page->notes,
                'scannedAt' => $page->scanned_at?->toISOString(),
            ],
            'record' => [
                'id' => $page->healthRecord->id,
                'name' => $page->healthRecord->name,
            ],
        ]);
    }

    /**
     * Update the specified page notes.
     */
    public function update(Request $request, Team $currentTeam, HealthRecordPage $page): RedirectResponse
    {
        abort_unless($page->healthRecord->user_id === $request->user()->id, 403);

        $request->validate([
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $page->update([
            'notes' => $request->input('notes'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Notes mises à jour.']);

        return back();
    }

    /**
     * Remove the specified page.
     */
    public function destroy(Request $request, Team $currentTeam, HealthRecordPage $page): RedirectResponse
    {
        abort_unless($page->healthRecord->user_id === $request->user()->id, 403);

        $recordId = $page->health_record_id;

        Storage::disk('public')->delete($page->image_path);
        $page->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Page supprimée.']);

        return to_route('health-records.show', $recordId);
    }
}
