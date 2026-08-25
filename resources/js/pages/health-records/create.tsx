import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Camera, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { index, store } from '@/routes/health-records';
import type { RelationshipOption } from '@/types';

type Props = {
    relationships: RelationshipOption[];
};

export default function HealthRecordsCreate({ relationships }: Props) {
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setCoverPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <>
            <Head title="Nouveau carnet de santé" />

            <div className="flex flex-col space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={index()}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Heading
                        variant="small"
                        title="Nouveau carnet de santé"
                        description="Créez un carnet pour vous ou un membre de votre famille"
                    />
                </div>

                <Card>
                    <Form
                        {...store.form()}
                        encType="multipart/form-data"
                        className="flex flex-col"
                    >
                        {({ processing, errors }) => (
                            <>
                                <CardContent className="space-y-6 pt-6">
                                    {/* Cover Photo */}
                                    <div className="space-y-2">
                                        <Label>Photo de couverture</Label>
                                        <div
                                            className="relative flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-muted transition-colors hover:border-primary"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                        >
                                            {coverPreview ? (
                                                <img
                                                    src={coverPreview}
                                                    alt="Aperçu"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                    <Camera className="h-8 w-8" />
                                                    <span className="text-sm">
                                                        Scanner la couverture
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            name="cover_photo"
                                            accept="image/*"
                                            capture="environment"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                        <InputError
                                            message={errors.cover_photo}
                                        />
                                    </div>

                                    {/* Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name">
                                            Nom du titulaire
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder="Ex: Jean Dupont"
                                            required
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    {/* Date of Birth */}
                                    <div className="space-y-2">
                                        <Label htmlFor="date_of_birth">
                                            Date de naissance
                                        </Label>
                                        <Input
                                            id="date_of_birth"
                                            name="date_of_birth"
                                            type="date"
                                        />
                                        <InputError
                                            message={errors.date_of_birth}
                                        />
                                    </div>

                                    {/* Relationship */}
                                    <div className="space-y-2">
                                        <Label htmlFor="relationship">
                                            Lien de parenté
                                        </Label>
                                        <Select
                                            name="relationship"
                                            defaultValue="self"
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {relationships.map((rel) => (
                                                    <SelectItem
                                                        key={rel.value}
                                                        value={rel.value}
                                                    >
                                                        {rel.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={errors.relationship}
                                        />
                                    </div>
                                </CardContent>

                                <CardFooter className="flex justify-end gap-2 border-t pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        asChild
                                    >
                                        <Link href={index()}>Annuler</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing && <Spinner />}
                                        Créer le carnet
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

HealthRecordsCreate.layout = {
    breadcrumbs: [
        {
            title: 'Carnets de santé',
            href: index(),
        },
        {
            title: 'Nouveau',
            href: '#',
        },
    ],
};
