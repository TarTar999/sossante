import { Form, Head, Link } from '@inertiajs/react';
import { AlertCircle, AlertTriangle, ArrowLeft, Clock } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { index, store } from '@/routes/consultations';
import type { UrgencyOption } from '@/types/consultation';

type Props = {
    urgencyOptions: UrgencyOption[];
};

function getUrgencyIcon(urgency: string) {
    switch (urgency) {
        case 'very_urgent':
            return <AlertCircle className="h-6 w-6" />;
        case 'urgent':
            return <AlertTriangle className="h-6 w-6" />;
        default:
            return <Clock className="h-6 w-6" />;
    }
}

function getUrgencyStyles(urgency: string, isSelected: boolean) {
    const base = 'border-2 transition-all';

    if (isSelected) {
        switch (urgency) {
            case 'very_urgent':
                return cn(base, 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300');
            case 'urgent':
                return cn(base, 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300');
            default:
                return cn(base, 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300');
        }
    }

    return cn(base, 'border-muted hover:border-primary/50');
}

export default function ConsultationsCreate({ urgencyOptions }: Props) {
    const [selectedUrgency, setSelectedUrgency] = useState<string>('standard');

    return (
        <>
            <Head title="Demander une consultation" />

            <div className="flex flex-col space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={index.url({})}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Heading
                        variant="small"
                        title="Demander une consultation"
                        description="Un médecin vous prendra en charge rapidement"
                    />
                </div>

                <Card>
                    <Form
                        {...store.post({})}
                        className="flex flex-col"
                    >
                        {({ processing, errors }) => (
                            <>
                                <CardContent className="space-y-6 pt-6">
                                    {/* Urgency Selector */}
                                    <div className="space-y-3">
                                        <Label>
                                            Niveau d'urgence{' '}
                                            <span className="text-destructive">*</span>
                                        </Label>
                                        <div className="grid gap-3 sm:grid-cols-3">
                                            {urgencyOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedUrgency(option.value)
                                                    }
                                                    className={cn(
                                                        'flex flex-col items-center gap-2 rounded-lg p-4',
                                                        getUrgencyStyles(
                                                            option.value,
                                                            selectedUrgency === option.value,
                                                        ),
                                                    )}
                                                >
                                                    {getUrgencyIcon(option.value)}
                                                    <span className="font-medium">
                                                        {option.label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                        <input
                                            type="hidden"
                                            name="urgency"
                                            value={selectedUrgency}
                                        />
                                        <InputError message={errors.urgency} />

                                        {selectedUrgency === 'very_urgent' && (
                                            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                                                <div className="flex items-center gap-2 font-medium">
                                                    <AlertCircle className="h-4 w-4" />
                                                    Attention
                                                </div>
                                                <p className="mt-1">
                                                    En cas d'urgence vitale, appelez
                                                    immédiatement le <strong>15</strong> (SAMU)
                                                    ou rendez-vous aux urgences les plus proches.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Symptoms */}
                                    <div className="space-y-2">
                                        <Label htmlFor="symptoms">
                                            Décrivez vos symptômes{' '}
                                            <span className="text-destructive">*</span>
                                        </Label>
                                        <Textarea
                                            id="symptoms"
                                            name="symptoms"
                                            placeholder="Décrivez vos symptômes, depuis quand ils sont apparus, et tout autre détail pertinent..."
                                            rows={5}
                                            required
                                        />
                                        <InputError message={errors.symptoms} />
                                        <p className="text-xs text-muted-foreground">
                                            Plus vous êtes précis, mieux le médecin pourra
                                            vous aider.
                                        </p>
                                    </div>
                                </CardContent>

                                <CardFooter className="flex justify-end gap-2 border-t pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        asChild
                                    >
                                        <Link href={index.url({})}>Annuler</Link>
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        variant={
                                            selectedUrgency === 'very_urgent'
                                                ? 'destructive'
                                                : 'default'
                                        }
                                    >
                                        {processing && <Spinner />}
                                        Envoyer la demande
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

ConsultationsCreate.layout = {
    breadcrumbs: [
        {
            title: 'Consultations',
            href: index.url({}),
        },
        {
            title: 'Nouvelle demande',
            href: '#',
        },
    ],
};
