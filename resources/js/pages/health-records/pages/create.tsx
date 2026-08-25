import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Camera, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { show } from '@/routes/health-records';
import { store } from '@/routes/health-records/pages';

type Props = {
    record: {
        id: number;
        name: string;
    };
    nextPageNumber: number;
};

export default function HealthRecordPagesCreate({
    record,
    nextPageNumber,
}: Props) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [useCamera, setUseCamera] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <>
            <Head title={`Ajouter une page - ${record.name}`} />

            <div className="flex flex-col space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={show(record.id)}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Heading
                        variant="small"
                        title={`Page ${nextPageNumber}`}
                        description={record.name}
                    />
                </div>

                <Card>
                    <Form
                        {...store.form(record.id)}
                        encType="multipart/form-data"
                        className="flex flex-col"
                    >
                        {({ processing, errors }) => (
                            <>
                                <CardContent className="space-y-6 pt-6">
                                    {/* Capture Mode Toggle */}
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant={
                                                useCamera
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            onClick={() => setUseCamera(true)}
                                        >
                                            <Camera className="mr-2 h-4 w-4" />
                                            Caméra
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={
                                                !useCamera
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            onClick={() => setUseCamera(false)}
                                        >
                                            <Upload className="mr-2 h-4 w-4" />
                                            Fichier
                                        </Button>
                                    </div>

                                    {/* Image Capture */}
                                    <div className="space-y-2">
                                        <Label>
                                            Image de la page{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <div
                                            className="relative flex aspect-[3/4] cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-muted transition-colors hover:border-primary"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                        >
                                            {imagePreview ? (
                                                <img
                                                    src={imagePreview}
                                                    alt="Aperçu"
                                                    className="h-full w-full object-contain"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 p-8 text-center text-muted-foreground">
                                                    {useCamera ? (
                                                        <Camera className="h-12 w-12" />
                                                    ) : (
                                                        <Upload className="h-12 w-12" />
                                                    )}
                                                    <span className="text-sm">
                                                        {useCamera
                                                            ? 'Appuyez pour prendre une photo'
                                                            : 'Appuyez pour sélectionner un fichier'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            name="image"
                                            accept="image/*"
                                            capture={
                                                useCamera
                                                    ? 'environment'
                                                    : undefined
                                            }
                                            className="hidden"
                                            onChange={handleFileChange}
                                            required
                                        />
                                        <InputError message={errors.image} />
                                    </div>

                                    {/* Notes */}
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">
                                            Notes (optionnel)
                                        </Label>
                                        <Textarea
                                            id="notes"
                                            name="notes"
                                            placeholder="Ajoutez des notes sur cette page..."
                                            rows={3}
                                        />
                                        <InputError message={errors.notes} />
                                    </div>
                                </CardContent>

                                <CardFooter className="flex justify-end gap-2 border-t pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        asChild
                                    >
                                        <Link href={show(record.id)}>
                                            Annuler
                                        </Link>
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing || !imagePreview}
                                    >
                                        {processing && <Spinner />}
                                        Ajouter la page
                                    </Button>
                                </CardFooter>
                            </>
                        )}
                    </Form>
                </Card>
            </div>
        </>
    );
}

HealthRecordPagesCreate.layout = {
    breadcrumbs: [
        {
            title: 'Carnets de santé',
            href: '/health-records',
        },
        {
            title: 'Ajouter une page',
            href: '#',
        },
    ],
};
