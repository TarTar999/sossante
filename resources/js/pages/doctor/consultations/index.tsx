import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    QrCode,
    Stethoscope,
    Users,
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
import { accept, index, show } from '@/routes/doctor/consultations';
import type { Consultation } from '@/types/consultation';

type Props = {
    pendingConsultations: Consultation[];
    activeConsultations: Consultation[];
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

export default function DoctorConsultationsIndex({
    pendingConsultations,
    activeConsultations,
}: Props) {
    const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
    const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
    const [isAccepting, setIsAccepting] = useState(false);

    const handleAcceptClick = (consultation: Consultation) => {
        setSelectedConsultation(consultation);
        setAcceptDialogOpen(true);
    };

    const handleAccept = () => {
        if (!selectedConsultation) return;

        setIsAccepting(true);
        router.post(
            accept.url({ consultation: selectedConsultation.id }),
            {},
            {
                onFinish: () => {
                    setIsAccepting(false);
                    setAcceptDialogOpen(false);
                },
            },
        );
    };

    return (
        <>
            <Head title="Consultations - Médecin" />

            <div className="flex flex-col space-y-6">
                <Heading
                    variant="small"
                    title="Tableau de bord médecin"
                    description="Gérez vos consultations en cours et les demandes en attente"
                />

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {pendingConsultations.length}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Demandes en attente
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                <Stethoscope className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {activeConsultations.length}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Consultations actives
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Active Consultations */}
                {activeConsultations.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Stethoscope className="h-5 w-5" />
                                Mes consultations en cours
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {activeConsultations.map((consultation) => (
                                <Link
                                    key={consultation.id}
                                    href={show.url({ consultation: consultation.id })}
                                    className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">
                                                    {consultation.patientName}
                                                </span>
                                            </div>
                                            <p className="line-clamp-1 text-sm text-muted-foreground">
                                                {consultation.symptoms}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge
                                                variant={
                                                    consultation.qrScanned
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {consultation.qrScanned ? (
                                                    <>
                                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                                        En cours
                                                    </>
                                                ) : (
                                                    <>
                                                        <QrCode className="mr-1 h-3 w-3" />
                                                        À scanner
                                                    </>
                                                )}
                                            </Badge>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Pending Consultations */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Demandes en attente
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pendingConsultations.length === 0 ? (
                            <div className="flex flex-col items-center py-8 text-center">
                                <Clock className="mb-4 h-12 w-12 text-muted-foreground/50" />
                                <p className="text-muted-foreground">
                                    Aucune demande en attente
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingConsultations.map((consultation) => (
                                    <div
                                        key={consultation.id}
                                        className="rounded-lg border p-4"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2">
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
                                                    <span className="text-sm text-muted-foreground">
                                                        {consultation.waitingTime}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">
                                                        {consultation.patientName}
                                                    </span>
                                                </div>
                                                <p className="line-clamp-2 text-sm text-muted-foreground">
                                                    {consultation.symptoms}
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() =>
                                                    handleAcceptClick(consultation)
                                                }
                                                size="sm"
                                            >
                                                Accepter
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Accept Dialog */}
            <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Accepter cette consultation ?</DialogTitle>
                        <DialogDescription>
                            Vous serez assigné à ce patient et devrez scanner son
                            QR code pour démarrer la consultation.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedConsultation && (
                        <div className="space-y-2 rounded-lg bg-muted p-4">
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant={getUrgencyBadgeVariant(
                                        selectedConsultation.urgency,
                                    )}
                                >
                                    {selectedConsultation.urgencyLabel}
                                </Badge>
                            </div>
                            <p className="font-medium">
                                {selectedConsultation.patientName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {selectedConsultation.symptoms}
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setAcceptDialogOpen(false)}
                        >
                            Annuler
                        </Button>
                        <Button onClick={handleAccept} disabled={isAccepting}>
                            {isAccepting && <Spinner />}
                            Accepter
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

DoctorConsultationsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Espace médecin',
            href: index.url({}),
        },
    ],
};
