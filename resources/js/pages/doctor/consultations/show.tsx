import { Form, Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Droplet,
    FileText,
    Heart,
    Phone,
    QrCode,
    Stethoscope,
    Timer,
    User,
} from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { complete, index, scan, show } from '@/routes/doctor/consultations';
import type { Consultation, PatientInfo } from '@/types/consultation';

type Props = {
    consultation: Consultation;
    patient: PatientInfo;
};

function getUrgencyBadgeVariant(urgency: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (urgency) {
        case 'very_urgent':
            return 'destructive';
        case 'urgent':
            return 'default';
        default:
            return 'secondary';
    }
}

function getStatusColor(status: string) {
    switch (status) {
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case 'accepted':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case 'in_progress':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
        case 'completed':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
}

export default function DoctorConsultationsShow({
    consultation,
    patient,
}: Props) {
    const [qrCode, setQrCode] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [notes, setNotes] = useState(consultation.notes || '');

    const handleScanQr = (e: React.FormEvent) => {
        e.preventDefault();
        setIsScanning(true);
        setScanError(null);

        router.post(
            scan.url({ consultation: consultation.id }),
            { qr_code: qrCode },
            {
                onError: (errors) => {
                    setScanError(errors.qr_code || 'QR Code invalide');
                },
                onFinish: () => {
                    setIsScanning(false);
                },
            },
        );
    };

    const handleComplete = () => {
        setIsCompleting(true);
        router.post(
            complete.url({ consultation: consultation.id }),
            { notes },
            {
                onFinish: () => {
                    setIsCompleting(false);
                    setCompleteDialogOpen(false);
                },
            },
        );
    };

    const isAccepted = consultation.status === 'accepted';
    const isInProgress = consultation.status === 'in_progress';

    return (
        <>
            <Head title={`Consultation #${consultation.id}`} />

            <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={index.url({})}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">
                                Consultation #{consultation.id}
                            </h1>
                            <div className="mt-1 flex items-center gap-2">
                                <Badge
                                    variant={getUrgencyBadgeVariant(
                                        consultation.urgency,
                                    )}
                                >
                                    {consultation.urgency === 'very_urgent' && (
                                        <AlertCircle className="mr-1 h-3 w-3" />
                                    )}
                                    {consultation.urgencyLabel}
                                </Badge>
                                <Badge variant="outline">
                                    {consultation.statusLabel}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {consultation.canBeCompleted && (
                        <Button onClick={() => setCompleteDialogOpen(true)}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Terminer
                        </Button>
                    )}
                </div>

                {/* QR Scanner - Show when accepted but not scanned */}
                {consultation.canBeStarted && (
                    <Card className="border-primary">
                        <CardHeader className="text-center">
                            <CardTitle className="flex items-center justify-center gap-2">
                                <QrCode className="h-5 w-5" />
                                Scanner le QR Code du patient
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={handleScanQr}
                                className="flex flex-col gap-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="qr_code">Code QR</Label>
                                    <Input
                                        id="qr_code"
                                        value={qrCode}
                                        onChange={(e) =>
                                            setQrCode(e.target.value)
                                        }
                                        placeholder="Entrez ou scannez le code QR"
                                        required
                                    />
                                    {scanError && (
                                        <InputError message={scanError} />
                                    )}
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isScanning || !qrCode}
                                >
                                    {isScanning && <Spinner />}
                                    Valider et démarrer
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Status Card */}
                {(isAccepted || isInProgress) && !consultation.canBeStarted && (
                    <Card>
                        <CardContent className="p-6">
                            <div
                                className={`flex items-center gap-3 rounded-lg p-4 ${getStatusColor(consultation.status)}`}
                            >
                                {isInProgress ? (
                                    <Stethoscope className="h-5 w-5" />
                                ) : (
                                    <CheckCircle2 className="h-5 w-5" />
                                )}
                                <div>
                                    <p className="font-medium">
                                        {consultation.statusLabel}
                                    </p>
                                    {isInProgress && (
                                        <p className="text-sm opacity-75">
                                            Consultation en cours - QR scanné à{' '}
                                            {consultation.qrScannedAt &&
                                                new Date(
                                                    consultation.qrScannedAt,
                                                ).toLocaleTimeString('fr-FR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Patient Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Informations patient
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Nom
                                </p>
                                <p className="font-medium">{patient.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Email
                                </p>
                                <p className="font-medium">{patient.email}</p>
                            </div>
                            {patient.phone && (
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Téléphone
                                    </p>
                                    <p className="flex items-center gap-2 font-medium">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        {patient.phone}
                                    </p>
                                </div>
                            )}
                            {patient.dateOfBirth && (
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Date de naissance
                                    </p>
                                    <p className="flex items-center gap-2 font-medium">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        {new Date(
                                            patient.dateOfBirth,
                                        ).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Medical Info */}
                        {(patient.bloodType ||
                            patient.allergies ||
                            patient.chronicConditions) && (
                            <>
                                <div className="border-t pt-4">
                                    <p className="mb-3 flex items-center gap-2 font-medium">
                                        <Heart className="h-4 w-4" />
                                        Informations médicales
                                    </p>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {patient.bloodType && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Groupe sanguin
                                                </p>
                                                <p className="flex items-center gap-2 font-medium">
                                                    <Droplet className="h-4 w-4 text-red-500" />
                                                    {patient.bloodType}
                                                </p>
                                            </div>
                                        )}
                                        {patient.allergies && (
                                            <div className="sm:col-span-2">
                                                <p className="text-sm text-muted-foreground">
                                                    Allergies
                                                </p>
                                                <p className="font-medium text-red-600 dark:text-red-400">
                                                    {patient.allergies}
                                                </p>
                                            </div>
                                        )}
                                        {patient.chronicConditions && (
                                            <div className="sm:col-span-2">
                                                <p className="text-sm text-muted-foreground">
                                                    Conditions chroniques
                                                </p>
                                                <p className="font-medium">
                                                    {patient.chronicConditions}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Emergency Contact */}
                        {(patient.emergencyContactName ||
                            patient.emergencyContactPhone) && (
                            <div className="border-t pt-4">
                                <p className="mb-3 flex items-center gap-2 font-medium">
                                    <Phone className="h-4 w-4" />
                                    Contact d'urgence
                                </p>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {patient.emergencyContactName && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Nom
                                            </p>
                                            <p className="font-medium">
                                                {patient.emergencyContactName}
                                            </p>
                                        </div>
                                    )}
                                    {patient.emergencyContactPhone && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Téléphone
                                            </p>
                                            <p className="font-medium">
                                                {patient.emergencyContactPhone}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Symptoms */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Symptômes décrits
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap text-muted-foreground">
                            {consultation.symptoms}
                        </p>
                    </CardContent>
                </Card>

                {/* Timeline */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Chronologie
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                Demande reçue
                            </span>
                            <span>
                                {new Date(
                                    consultation.createdAt,
                                ).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </div>

                        {consultation.qrScannedAt && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    QR Code scanné
                                </span>
                                <span>
                                    {new Date(
                                        consultation.qrScannedAt,
                                    ).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                        )}

                        {consultation.consultationStartedAt && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Consultation démarrée
                                </span>
                                <span>
                                    {new Date(
                                        consultation.consultationStartedAt,
                                    ).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                        )}

                        {consultation.consultationEndedAt && (
                            <>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Consultation terminée
                                    </span>
                                    <span>
                                        {new Date(
                                            consultation.consultationEndedAt,
                                        ).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                                {consultation.durationMinutes && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-1 text-muted-foreground">
                                            <Timer className="h-3 w-3" />
                                            Durée
                                        </span>
                                        <span>
                                            {consultation.durationMinutes} min
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Notes */}
                {consultation.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Notes de consultation
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap">
                                {consultation.notes}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Complete Dialog */}
            <Dialog
                open={completeDialogOpen}
                onOpenChange={setCompleteDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Terminer la consultation</DialogTitle>
                        <DialogDescription>
                            Ajoutez des notes avant de terminer cette
                            consultation.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (optionnel)</Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Diagnostic, recommandations, prescriptions..."
                                rows={5}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCompleteDialogOpen(false)}
                        >
                            Annuler
                        </Button>
                        <Button onClick={handleComplete} disabled={isCompleting}>
                            {isCompleting && <Spinner />}
                            Terminer la consultation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

DoctorConsultationsShow.layout = {
    breadcrumbs: [
        {
            title: 'Espace médecin',
            href: index.url({}),
        },
        {
            title: 'Consultation',
            href: '#',
        },
    ],
};
