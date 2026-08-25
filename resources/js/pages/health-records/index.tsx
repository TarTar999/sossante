import { Head, Link } from '@inertiajs/react';
import { BookHeart, Calendar, Eye, Plus, Trash2, Users } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { create, index, show } from '@/routes/health-records';
import type { HealthRecord, RelationshipOption } from '@/types';

type Props = {
    records: HealthRecord[];
    relationships: RelationshipOption[];
};

export default function HealthRecordsIndex({ records }: Props) {
    return (
        <>
            <Head title="Carnets de santé" />

            <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                    <Heading
                        variant="small"
                        title="Carnets de santé"
                        description="Gérez vos carnets de santé et ceux de votre famille"
                    />

                    <Button asChild>
                        <Link href={create()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nouveau carnet
                        </Link>
                    </Button>
                </div>

                {records.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <BookHeart className="mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="text-lg font-medium">
                                Aucun carnet de santé
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Créez votre premier carnet de santé pour
                                commencer.
                            </p>
                            <Button asChild className="mt-4">
                                <Link href={create()}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Créer un carnet
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {records.map((record) => (
                            <Card
                                key={record.id}
                                className="group overflow-hidden transition-shadow hover:shadow-md"
                            >
                                <Link href={show(record.id)}>
                                    <div className="relative aspect-[4/3] bg-muted">
                                        {record.coverPhotoUrl ? (
                                            <img
                                                src={record.coverPhotoUrl}
                                                alt={record.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <BookHeart className="h-16 w-16 text-muted-foreground/50" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 p-4">
                                            <h3 className="font-semibold text-white">
                                                {record.name}
                                            </h3>
                                            <div className="mt-1 flex items-center gap-2 text-sm text-white/80">
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-white/20 text-white"
                                                >
                                                    {record.relationshipLabel}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                <span>
                                                    {record.pagesCount} page
                                                    {record.pagesCount !== 1
                                                        ? 's'
                                                        : ''}
                                                </span>
                                            </div>
                                            {record.dateOfBirth && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>
                                                        {new Date(
                                                            record.dateOfBirth,
                                                        ).toLocaleDateString(
                                                            'fr-FR',
                                                        )}
                                                    </span>
                                                </div>
                                            )}
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

HealthRecordsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Carnets de santé',
            href: index(),
        },
    ],
};
