import { Head, router } from '@inertiajs/react';
import {
    Award,
    Calendar,
    CheckCircle,
    Mail,
    Stethoscope,
    User,
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
import { pending, reject, verify } from '@/routes/admin/doctors';

type PendingDoctor = {
    userId: number;
    name: string;
    email: string;
    licenseNumber: string;
    specialization: string | null;
    createdAt: string;
};

type Props = {
    pendingDoctors: PendingDoctor[];
};

export default function AdminDoctorsPending({ pendingDoctors }: Props) {
    const [selectedDoctor, setSelectedDoctor] = useState<PendingDoctor | null>(
        null,
    );
    const [actionType, setActionType] = useState<'verify' | 'reject' | null>(
        null,
    );
    const [isProcessing, setIsProcessing] = useState(false);

    const handleOpenDialog = (
        doctor: PendingDoctor,
        action: 'verify' | 'reject',
    ) => {
        setSelectedDoctor(doctor);
        setActionType(action);
    };

    const handleCloseDialog = () => {
        setSelectedDoctor(null);
        setActionType(null);
    };

    const handleAction = () => {
        if (!selectedDoctor || !actionType) return;

        setIsProcessing(true);

        const url =
            actionType === 'verify'
                ? verify.url({ user: selectedDoctor.userId })
                : reject.url({ user: selectedDoctor.userId });

        router.post(url, {}, {
            onFinish: () => {
                setIsProcessing(false);
                handleCloseDialog();
            },
        });
    };

    return (
        <>
            <Head title="Vérification médecins - Admin" />

            <div className="flex flex-col space-y-6">
                <Heading
                    variant="small"
                    title="Vérification des médecins"
                    description="Gérez les demandes de vérification des médecins"
                />

                {/* Stats */}
                <Card>
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                            <Stethoscope className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {pendingDoctors.length}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Demande{pendingDoctors.length !== 1 && 's'} en
                                attente
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Pending List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Demandes de vérification
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pendingDoctors.length === 0 ? (
                            <div className="flex flex-col items-center py-8 text-center">
                                <CheckCircle className="mb-4 h-12 w-12 text-green-500" />
                                <p className="text-muted-foreground">
                                    Aucune demande en attente
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pendingDoctors.map((doctor) => (
                                    <div
                                        key={doctor.userId}
                                        className="rounded-lg border p-4"
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">
                                                        {doctor.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Mail className="h-4 w-4" />
                                                    {doctor.email}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge variant="secondary">
                                                        <Award className="mr-1 h-3 w-3" />
                                                        {doctor.licenseNumber}
                                                    </Badge>
                                                    {doctor.specialization && (
                                                        <Badge variant="outline">
                                                            <Stethoscope className="mr-1 h-3 w-3" />
                                                            {
                                                                doctor.specialization
                                                            }
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    Demandé le{' '}
                                                    {new Date(
                                                        doctor.createdAt,
                                                    ).toLocaleDateString(
                                                        'fr-FR',
                                                        {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        },
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        handleOpenDialog(
                                                            doctor,
                                                            'verify',
                                                        )
                                                    }
                                                >
                                                    <CheckCircle className="mr-1 h-4 w-4" />
                                                    Vérifier
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        handleOpenDialog(
                                                            doctor,
                                                            'reject',
                                                        )
                                                    }
                                                >
                                                    <XCircle className="mr-1 h-4 w-4" />
                                                    Rejeter
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Confirmation Dialog */}
            <Dialog
                open={!!selectedDoctor && !!actionType}
                onOpenChange={handleCloseDialog}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === 'verify'
                                ? 'Vérifier ce médecin ?'
                                : 'Rejeter cette demande ?'}
                        </DialogTitle>
                        <DialogDescription>
                            {actionType === 'verify'
                                ? 'Ce médecin pourra accéder aux fonctionnalités réservées aux médecins vérifiés.'
                                : "Cette demande sera rejetée et le numéro de licence sera supprimé. L'utilisateur devra soumettre une nouvelle demande."}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedDoctor && (
                        <div className="space-y-2 rounded-lg bg-muted p-4">
                            <p className="font-medium">{selectedDoctor.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Award className="h-4 w-4" />
                                {selectedDoctor.licenseNumber}
                            </div>
                            {selectedDoctor.specialization && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Stethoscope className="h-4 w-4" />
                                    {selectedDoctor.specialization}
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseDialog}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleAction}
                            disabled={isProcessing}
                            variant={
                                actionType === 'reject'
                                    ? 'destructive'
                                    : 'default'
                            }
                        >
                            {isProcessing && <Spinner />}
                            {actionType === 'verify' ? 'Vérifier' : 'Rejeter'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

AdminDoctorsPending.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: '#',
        },
        {
            title: 'Médecins en attente',
            href: pending.url({}),
        },
    ],
};
