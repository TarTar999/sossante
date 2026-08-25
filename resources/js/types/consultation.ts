export type ConsultationUrgency = 'standard' | 'urgent' | 'very_urgent';
export type ConsultationStatus =
    | 'pending'
    | 'accepted'
    | 'in_progress'
    | 'completed'
    | 'cancelled';

export type UrgencyOption = {
    value: ConsultationUrgency;
    label: string;
    color: string;
};

export type Consultation = {
    id: number;
    urgency: ConsultationUrgency;
    urgencyLabel: string;
    urgencyColor: string;
    urgencyBadgeClasses?: string;
    status: ConsultationStatus;
    statusLabel: string;
    statusColor: string;
    symptoms: string;
    doctorName?: string | null;
    doctorSpecialization?: string | null;
    qrCode: string;
    qrScanned?: boolean;
    qrScannedAt?: string | null;
    consultationStartedAt?: string | null;
    consultationEndedAt?: string | null;
    durationMinutes?: number | null;
    notes?: string | null;
    createdAt: string;
    canBeCancelled?: boolean;
    canBeStarted?: boolean;
    canBeCompleted?: boolean;
    waitingTime?: string;
    patientName?: string;
};

export type PatientInfo = {
    name: string;
    email: string;
    phone?: string | null;
    dateOfBirth?: string | null;
    bloodType?: string | null;
    allergies?: string | null;
    chronicConditions?: string | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
};

export type CniSearchResult = {
    name: string;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    dateOfBirth?: string | null;
    bloodType?: string | null;
    allergies?: string | null;
    chronicConditions?: string | null;
    phone?: string | null;
    address?: string | null;
};
