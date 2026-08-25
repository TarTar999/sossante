import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    QrCode,
    Stethoscope,
    Timer,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
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
import { Spinner } from '@/components/ui/spinner';
import { destroy, index, show } from '@/routes/consultations';
import type { Consultation } from '@/types/consultation';

type Props = {
    consultation: Consultation;
};

function getStatusIcon(status: string) {
    switch (status) {
        case 'pending':
            return <Clock className="h-5 w-5" />;
        case 'accepted':
            return <CheckCircle2 className="h-5 w-5" />;
        case 'in_progress':
            return <Stethoscope className="h-5 w-5" />;
        case 'completed':
            return <CheckCircle2 className="h-5 w-5" />;
        case 'cancelled':
            return <XCircle className="h-5 w-5" />;
        default:
            return <Clock className="h-5 w-5" />;
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
        case 'cancelled':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
}

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

export default function ConsultationsShow({ consultation }: Props) {
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const handleCancel = () => {
        setIsCancelling(true);
        router.delete(destroy.url({ consultation: consultation.id }), {
            onFinish: () => setIsCancelling(false),
        });
    };

    const isPending = consultation.status === 'pending';
    const isAccepted = consultation.status === 'accepted';
    const isInProgress = consultation.status === 'in_progress';
    const isCompleted = consultation.status === 'completed';
    const showQrCode = isAccepted && !consultation.qrScannedAt;

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
                            </div>
                        </div>
                    </div>

                    {consultation.canBeCancelled && (
                        <Button
                            variant="outline"
                            onClick={() => setCancelDialogOpen(true)}
                        >
                            Annuler
                        </Button>
                    )}
                </div>

                {/* Status Card */}
                <Card>
                    <CardContent className="p-6">
                        <div
                            className={`flex items-center gap-3 rounded-lg p-4 ${getStatusColor(consultation.status)}`}
                        >
                            {getStatusIcon(consultation.status)}
                            <div>
                                <p className="font-medium">
                                    {consultation.statusLabel}
                                </p>
                                {isPending && (
                                    <p className="text-sm opacity-75">
                                        En attente qu'un médecin accepte votre demande
                                    </p>
                                )}
                                {isAccepted && (
                                    <p className="text-sm opacity-75">
                                        Dr. {consultation.doctorName} a accepté votre demande
                                    </p>
                                )}
                                {isInProgress && (
                                    <p className="text-sm opacity-75">
                                        Consultation en cours avec Dr. {consultation.doctorName}
                                    </p>
                                )}
                                {isCompleted && (
                                    <p className="text-sm opacity-75">
                                        Consultation terminée
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* QR Code Card - Show when accepted and not scanned */}
                {showQrCode && (
                    <Card className="border-primary">
                        <CardHeader className="text-center">
                            <CardTitle className="flex items-center justify-center gap-2">
                                <QrCode className="h-5 w-5" />
                                Code QR de validation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                            <div className="rounded-lg bg-white p-4">
                                <div className="flex h-48 w-48 items-center justify-center border-2 border-dashed border-gray-300">
                                    <div className="text-center">
                                        <QrCode className="mx-auto h-16 w-16 text-gray-400" />
                                        <p className="mt-2 text-xs text-gray-500">
                                            {consultation.qrCode}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-center text-sm text-muted-foreground">
                                Présentez ce code au médecin pour démarrer la
                                consultation
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Details */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Symptoms Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="h-4 w-4" />
                                Symptômes décrits
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                                {consultation.symptoms}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Timeline Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Calendar className="h-4 w-4" />
                                Chronologie
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Demande envoyée
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
                            )}

                            {consultation.durationMinutes && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                        <Timer className="h-3 w-3" />
                                        Durée
                                    </span>
                                    <span>{consultation.durationMinutes} min</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Doctor info */}
                {consultation.doctorName && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Stethoscope className="h-4 w-4" />
                                Médecin
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Stethoscope className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-medium">
                                        Dr. {consultation.doctorName}
                                    </p>
                                    {consultation.doctorSpecialization && (
                                        <p className="text-sm text-muted-foreground">
                                            {consultation.doctorSpecialization}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Notes from doctor */}
                {consultation.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="h-4 w-4" />
                                Notes du médecin
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap text-sm">
                                {consultation.notes}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Cancel Dialog */}
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Annuler cette demande ?</DialogTitle>
                        <DialogDescription>
                            Cette action est irréversible. Vous devrez créer une
                            nouvelle demande si nécessaire.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCancelDialogOpen(false)}
                        >
                            Retour
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancel}
                            disabled={isCancelling}
                        >
                            {isCancelling && <Spinner />}
                            Annuler la demande
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

ConsultationsShow.layout = {
    breadcrumbs: [
        {
            title: 'Consultations',
            href: index.url({}),
        },
        {
            title: 'Détails',
            href: '#',
        },
    ],
};
