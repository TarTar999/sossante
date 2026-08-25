import { Form, Head } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    Droplet,
    Heart,
    MapPin,
    Phone,
    Search,
    Shield,
    User,
} from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { cni } from '@/routes/search';
import type { CniSearchResult } from '@/types/consultation';

type Props = {
    result: CniSearchResult | null;
    notFound?: boolean;
    searchedCni?: string;
    isDoctor?: boolean;
};

export default function CniSearch({
    result,
    notFound,
    searchedCni,
    isDoctor,
}: Props) {
    return (
        <>
            <Head title="Recherche CNI" />

            <div className="flex flex-col space-y-6">
                <Heading
                    variant="small"
                    title="Recherche par CNI"
                    description="Recherchez les informations d'urgence d'une personne"
                />

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Rechercher
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...cni.search.post({})}
                            className="flex flex-col gap-4 sm:flex-row"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="cni">
                                            Numéro de CNI
                                        </Label>
                                        <Input
                                            id="cni"
                                            name="cni"
                                            placeholder="Entrez le numéro de CNI"
                                            defaultValue={searchedCni || ''}
                                            required
                                        />
                                        <InputError message={errors.cni} />
                                    </div>
                                    <div className="flex items-end">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing && <Spinner />}
                                            <Search className="mr-2 h-4 w-4" />
                                            Rechercher
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                {/* Not Found Alert */}
                {notFound && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Aucun résultat</AlertTitle>
                        <AlertDescription>
                            Aucun profil trouvé pour le CNI "{searchedCni}".
                        </AlertDescription>
                    </Alert>
                )}

                {/* Results */}
                {result && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Résultat de la recherche
                                </CardTitle>
                                {isDoctor && (
                                    <Badge variant="secondary">
                                        <Shield className="mr-1 h-3 w-3" />
                                        Vue médecin
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Basic Info */}
                            <div>
                                <h3 className="mb-3 font-medium">
                                    Informations de base
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Nom
                                        </p>
                                        <p className="font-medium">
                                            {result.name}
                                        </p>
                                    </div>
                                    {isDoctor && result.dateOfBirth && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Date de naissance
                                            </p>
                                            <p className="flex items-center gap-2 font-medium">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                {new Date(
                                                    result.dateOfBirth,
                                                ).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                    )}
                                    {isDoctor && result.phone && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Téléphone
                                            </p>
                                            <p className="flex items-center gap-2 font-medium">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                {result.phone}
                                            </p>
                                        </div>
                                    )}
                                    {isDoctor && result.address && (
                                        <div className="sm:col-span-2">
                                            <p className="text-sm text-muted-foreground">
                                                Adresse
                                            </p>
                                            <p className="flex items-center gap-2 font-medium">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                {result.address}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            {(result.emergencyContactName ||
                                result.emergencyContactPhone) && (
                                <div className="border-t pt-4">
                                    <h3 className="mb-3 flex items-center gap-2 font-medium">
                                        <Phone className="h-4 w-4" />
                                        Contact d'urgence
                                    </h3>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {result.emergencyContactName && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Nom
                                                </p>
                                                <p className="font-medium">
                                                    {result.emergencyContactName}
                                                </p>
                                            </div>
                                        )}
                                        {result.emergencyContactPhone && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Téléphone
                                                </p>
                                                <p className="font-medium">
                                                    {result.emergencyContactPhone}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Medical Info - Only for doctors */}
                            {isDoctor &&
                                (result.bloodType ||
                                    result.allergies ||
                                    result.chronicConditions) && (
                                    <div className="border-t pt-4">
                                        <h3 className="mb-3 flex items-center gap-2 font-medium">
                                            <Heart className="h-4 w-4" />
                                            Informations médicales
                                        </h3>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {result.bloodType && (
                                                <div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Groupe sanguin
                                                    </p>
                                                    <p className="flex items-center gap-2 font-medium">
                                                        <Droplet className="h-4 w-4 text-red-500" />
                                                        {result.bloodType}
                                                    </p>
                                                </div>
                                            )}
                                            {result.allergies && (
                                                <div className="sm:col-span-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Allergies
                                                    </p>
                                                    <p className="font-medium text-red-600 dark:text-red-400">
                                                        {result.allergies}
                                                    </p>
                                                </div>
                                            )}
                                            {result.chronicConditions && (
                                                <div className="sm:col-span-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Conditions chroniques
                                                    </p>
                                                    <p className="font-medium">
                                                        {result.chronicConditions}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Info notice for non-doctors */}
                            {!isDoctor && (
                                <Alert>
                                    <Shield className="h-4 w-4" />
                                    <AlertTitle>Informations limitées</AlertTitle>
                                    <AlertDescription>
                                        Seuls les médecins vérifiés peuvent
                                        accéder aux informations médicales
                                        complètes.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

CniSearch.layout = {
    breadcrumbs: [
        {
            title: 'Recherche CNI',
            href: cni.url({}),
        },
    ],
};
