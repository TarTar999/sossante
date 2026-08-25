import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-gradient-to-br from-emerald-50 to-teal-100 p-6 md:p-10 dark:from-gray-900 dark:to-gray-800">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600">
                                <AppLogoIcon className="size-7 text-white" />
                            </div>
                            <span className="text-lg font-bold text-emerald-800 dark:text-emerald-400">SOS Santé</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-medium text-gray-900 dark:text-white">{title}</h1>
                            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                                {description}
                            </p>
                        </div>
                    </div>
                    <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
