import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';

export default function Welcome() {
    const { auth, currentTeam } = usePage().props;
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/';

    return (
        <>
            <Head title="SOS Santé - Votre santé, notre priorité" />
            <div className="flex min-h-screen flex-col bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-900 dark:to-gray-800">
                {/* Header */}
                <header className="w-full border-b border-emerald-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-emerald-800 dark:text-emerald-400">SOS Santé</span>
                        </div>
                        <nav className="flex items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={dashboardUrl}
                                    className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-lg px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-gray-800"
                                    >
                                        Connexion
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                                    >
                                        S'inscrire
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl dark:text-white">
                            <span className="block">Votre santé,</span>
                            <span className="block text-emerald-600 dark:text-emerald-400">notre priorité</span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl dark:text-gray-300">
                            Gérez vos carnets de santé numériques, demandez des consultations médicales en temps réel
                            et accédez à vos informations de santé en urgence.
                        </p>
                        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            {!auth.user && (
                                <>
                                    <Link
                                        href={register()}
                                        className="w-full rounded-lg bg-emerald-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-emerald-700 sm:w-auto"
                                    >
                                        Commencer gratuitement
                                    </Link>
                                    <Link
                                        href={login()}
                                        className="w-full rounded-lg border-2 border-emerald-600 px-8 py-3 text-lg font-semibold text-emerald-600 transition hover:bg-emerald-50 sm:w-auto dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-gray-800"
                                    >
                                        Se connecter
                                    </Link>
                                </>
                            )}
                            {auth.user && (
                                <Link
                                    href={dashboardUrl}
                                    className="rounded-lg bg-emerald-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-emerald-700"
                                >
                                    Accéder au Dashboard
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Features */}
                    <div className="mt-20 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Feature 1 */}
                        <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
                                <svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Carnets de Santé</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Numérisez et gérez vos carnets de santé. Ajoutez des pages, annotez et accédez-y partout.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900">
                                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Consultations Urgentes</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Demandez une consultation médicale avec un niveau d'urgence. Les médecins reçoivent votre demande en temps réel.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">QR Code d'Urgence</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                En cas d'urgence, scannez votre CNI pour accéder à vos informations médicales essentielles.
                            </p>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-emerald-200 bg-white/80 py-6 dark:border-gray-700 dark:bg-gray-900/80">
                    <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-600 dark:text-gray-400">
                        <p>&copy; 2024 SOS Santé. Tous droits réservés.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
