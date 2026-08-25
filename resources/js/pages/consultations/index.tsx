import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock,
    Plus,
    Stethoscope,
    XCircle,
} from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { create, index, show } from '@/routes/consultations';
import type { Consultation } from '@/types/consultation';

type Props = {
    consultations: Consultation[];
};

function getStatusIcon(status: string) {
    switch (status) {
        case 'pending':
            return <Clock className="h-4 w-4" />;
        case 'accepted':
            return <CheckCircle2 className="h-4 w-4" />;
        case 'in_progress':
            return <Stethoscope className="h-4 w-4" />;
        case 'completed':
            return <CheckCircle2 className="h-4 w-4" />;
        case 'cancelled':
            return <XCircle className="h-4 w-4" />;
        default:
            return <Clock className="h-4 w-4" />;
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

export default function ConsultationsIndex({ consultations }: Props) {
    return (
        <>
            <Head title="Mes consultations" />

            <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                    <Heading
                        variant="small"
                        title="Mes consultations"
                        description="Historique de vos demandes de consultation"
                    />

                    <Button asChild>
                        <Link href={create.url({})}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nouvelle demande
                        </Link>
                    </Button>
                </div>

                {consultations.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Stethoscope className="mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="text-lg font-medium">
                                Aucune consultation
                            </h3>
                            <p className="mt-1 text-center text-sm text-muted-foreground">
                                Vous n'avez pas encore demandé de consultation.
                            </p>
                            <Button asChild className="mt-4">
                                <Link href={create.url({})}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Demander une consultation
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {consultations.map((consultation) => (
                            <Card
                                key={consultation.id}
                                className="transition-shadow hover:shadow-md"
                            >
                                <Link href={show.url({ consultation: consultation.id })}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
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
                                                    <Badge
                                                        variant="outline"
                                                        className="gap-1"
                                                    >
                                                        {getStatusIcon(
                                                            consultation.status,
                                                        )}
                                                        {consultation.statusLabel}
                                                    </Badge>
                                                </div>

                                                <p className="line-clamp-2 text-sm text-muted-foreground">
                                                    {consultation.symptoms}
                                                </p>

                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(
                                                            consultation.createdAt,
                                                        ).toLocaleDateString('fr-FR', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </span>
                                                    {consultation.doctorName && (
                                                        <span className="flex items-center gap-1">
                                                            <Stethoscope className="h-3 w-3" />
                                                            Dr. {consultation.doctorName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Link>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

ConsultationsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Consultations',
            href: index.url({}),
        },
    ],
};
