export type RecordRelationship =
    | 'self'
    | 'child'
    | 'spouse'
    | 'parent'
    | 'sibling'
    | 'other';

export type RelationshipOption = {
    value: RecordRelationship;
    label: string;
    icon: string;
};

export type HealthRecord = {
    id: number;
    name: string;
    coverPhotoUrl?: string | null;
    dateOfBirth?: string | null;
    relationship: RecordRelationship;
    relationshipLabel: string;
    pagesCount: number;
    createdAt: string;
};

export type HealthRecordPage = {
    id: number;
    pageNumber: number;
    imageUrl: string;
    notes?: string | null;
    scannedAt?: string | null;
};
