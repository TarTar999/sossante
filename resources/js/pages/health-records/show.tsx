import { Form, Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    BookHeart,
    Calendar,
    FileText,
    Plus,
    Trash2,
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
import { destroy, edit, index, show } from '@/routes/health-records';
import { create as createPage } from '@/routes/health-records/pages';
import type { HealthRecord, HealthRecordPage } from '@/types';

type Props = {
    record: HealthRecord;
    pages: HealthRecordPage[];
};

export default function HealthRecordsShow({ record, pages }: Props) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(destroy(record.id), {
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <>
            <Head title={record.name} />

            <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={index()}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">
                                {record.name}
                            </h1>
                            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="secondary">
                                    {record.relationshipLabel}
                                </Badge>
                                {record.dateOfBirth && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(
                                            record.dateOfBirth,
                                        ).toLocaleDateString('fr-FR')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={edit(record.id)}>Modifier</Link>
                        </Button>
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => setDeleteDialogOpen(true)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Cover Photo */}
                {record.coverPhotoUrl && (
                    <Card>
                        <CardContent className="p-0">
                            <img
                                src={record.coverPhotoUrl}
                                alt="Couverture"
                                className="aspect-video w-full rounded-lg object-cover"
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Pages Timeline */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Pages ({pages.length})
                        </CardTitle>
                        <Button size="sm" asChild>
                            <Link href={createPage(record.id)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Ajouter une page
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {pages.length === 0 ? (
                            <div className="flex flex-col items-center py-8 text-center">
                                <BookHeart className="mb-4 h-12 w-12 text-muted-foreground/50" />
                                <p className="text-muted-foreground">
                                    Aucune page ajoutée
                                </p>
                                <Button size="sm" className="mt-4" asChild>
                                    <Link href={createPage(record.id)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Scanner une page
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {pages.map((page) => (
                                    <Link
                                        key={page.id}
                                        href={`/pages/${page.id}`}
                                        className="group relative aspect-[3/4] overflow-hidden rounded-lg border bg-muted transition-shadow hover:shadow-md"
                                    >
                                        <img
                                            src={page.imageUrl}
                                            alt={`Page ${page.pageNumber}`}
                                            className="h-full w-full object-cover"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                                            <p className="text-sm font-medium text-white">
                                                Page {page.pageNumber}
                                            </p>
                                            {page.scannedAt && (
                                                <p className="text-xs text-white/70">
                                                    {new Date(
                                                        page.scannedAt,
                                                    ).toLocaleDateString(
                                                        'fr-FR',
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer ce carnet ?</DialogTitle>
                        <DialogDescription>
                            Cette action est irréversible. Toutes les pages
                            seront également supprimées.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting && <Spinner />}
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

HealthRecordsShow.layout = {
    breadcrumbs: [
        {
            title: 'Carnets de santé',
            href: index(),
        },
        {
            title: 'Détails',
            href: '#',
        },
    ],
};
