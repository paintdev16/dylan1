import { createInertiaApp, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

type FlashProps = {
    success?: string;
    error?: string;
};

type LayoutComponent = typeof AppLayout | typeof AuthLayout | null;
type LayoutResolver = LayoutComponent | LayoutComponent[];

const TOASTER_OPTIONS = {
    position: 'top-right' as const,
    richColors: true,
    duration: 4000,
    closeButton: false,
    toastOptions: {
        classNames: {
            toast: 'rounded-xl shadow-lg',
            title: 'font-semibold',
            description: 'text-sm',
        },
    },
};

/**
 * Determina qué layout(s) usar según el nombre de la página de Inertia.
 */
function resolveLayout(name: string): LayoutResolver {
    if (name === 'welcome') return null;
    if (name.startsWith('auth/')) return AuthLayout;
    if (name.startsWith('settings/')) return [AppLayout, SettingsLayout];
    return AppLayout;
}

/**
 * Muestra un toast de éxito o error a partir de las props de flash de Laravel.
 */
function showFlashToasts(flash: FlashProps | undefined) {
    if (!flash) return;

    if (flash.success) {
        toast.success('Operación exitosa', {
            description: flash.success,
        });
    }

    if (flash.error) {
        toast.error('Ha ocurrido un error', {
            description: flash.error,
        });
    }
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: resolveLayout,
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delay={0}>
                {app}
                <Toaster {...TOASTER_OPTIONS} />
            </TooltipProvider>
        );
    },
    progress: {
        color: 'var(--primary)',
    },
});

// Aplica el tema claro/oscuro al cargar la app.
initializeTheme();

// Muestra notificaciones globales cuando el backend envía mensajes flash.
router.on('success', (event) => {
    const flash = event.detail.page.props.flash as FlashProps;
    showFlashToasts(flash);
});
