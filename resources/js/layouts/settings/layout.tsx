import type { PropsWithChildren } from 'react';

import Heading from '@/components/heading';

export default function SettingsLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl space-y-6">
                <Heading
                    title="Mi cuenta"
                    description="Administra tu información, acceso y seguridad desde un solo lugar."
                />
                {children}
            </div>
        </div>
    );
}
