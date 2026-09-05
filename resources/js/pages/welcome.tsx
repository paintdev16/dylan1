import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    ChefHat,
    CircleDollarSign,
    LayoutDashboard,
    LogIn,
    Package,
    ShieldCheck,
    Sparkles,
    Table2,
    Utensils,
    UtensilsCrossed,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { dashboard, login, register } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;

    const modules = [
        {
            title: 'Salón y Mesas',
            description:
                'Apertura de mesas con número de comensales, asignación automática de mozo y apertura inmediata de cuenta en caja.',
            icon: Table2,
            color: 'text-success bg-success-soft border-card-success-border',
            href: '/tables',
            badge: 'Salón',
        },
        {
            title: 'Menú Diario y Modalidades',
            description:
                'Configuración por fecha (Perú) de modalidades: Menú completo, Solo segundo y Entrada + postre, con stock de porciones.',
            icon: UtensilsCrossed,
            color: 'text-warning bg-warning-soft border-card-warning-border',
            href: '/daily-menu',
            badge: 'Cocina / Menú',
        },
        {
            title: 'Comandas Progresivas',
            description:
                'Toma de múltiples pedidos durante la misma atención sin duplicar cuentas, guardando componentes y notas exactas.',
            icon: Utensils,
            color: 'text-warning bg-warning-soft border-card-warning-border',
            href: '/orders',
            badge: 'Mozos',
        },
        {
            title: 'Cocina en Tiempo Real (KDS)',
            description:
                'Monitor de preparación FIFO para cocineros con filtrado inteligente: solo platos preparados, bebidas despachadas.',
            icon: ChefHat,
            color: 'text-destructive bg-destructive-soft border-destructive-border',
            href: '/kitchen',
            badge: 'KDS Cocina',
        },
        {
            title: 'Módulo de Caja y Cobro',
            description:
                'Turnos con fondo inicial, cobros multi-método (Efectivo, Tarjeta, Yape, Plin), cálculo de vuelto y arqueo con cuadre.',
            icon: CircleDollarSign,
            color: 'text-info bg-info-soft border-card-info-border',
            href: '/cash-register',
            badge: 'Caja',
        },
        {
            title: 'Cierre Post-Pago Atómico',
            description:
                'Al cubrir el 100% de la cuenta, en una sola transacción se cierra la sesión, se completan comandas y se libera la mesa.',
            icon: CheckCircle2,
            color: 'text-success bg-success-soft border-card-success-border',
            href: '/bills',
            badge: 'Automatización',
        },
        {
            title: 'Inventario y Auditoría',
            description:
                'Trazabilidad en tiempo real con stock_movements, control de stock de bebidas y cancelaciones justificadas con motivo.',
            icon: Package,
            color: 'text-kitchen bg-kitchen-soft border-card-kitchen-border',
            href: '/product-stock',
            badge: 'Almacén',
        },
        {
            title: 'Roles y Seguridad',
            description:
                'Perfiles especializados para Administrador, Mozo, Cocina y Cajero con permisos a nivel de controlador e interfaz.',
            icon: ShieldCheck,
            color: 'text-kitchen bg-kitchen-soft border-card-kitchen-border',
            href: '/users',
            badge: 'Seguridad',
        },
    ];

    const workflowSteps = [
        {
            step: '01',
            title: 'Planificación del Día',
            desc: 'El administrador activa el Menú Diario de hoy indicando segundos, entradas, postres y porciones disponibles.',
            icon: UtensilsCrossed,
        },
        {
            step: '02',
            title: 'Apertura de Mesa',
            desc: 'El mozo selecciona la mesa e ingresa comensales. El sistema crea la sesión y abre la cuenta en caja.',
            icon: Table2,
        },
        {
            step: '03',
            title: 'Comanda y Cocina KDS',
            desc: 'Se registran los platos elegidos. Cocina recibe solo los platos que requieren preparación en orden de llegada.',
            icon: ChefHat,
        },
        {
            step: '04',
            title: 'Cobro y Liberación',
            desc: 'Caja recibe el pago (Efectivo/Digital/POS), genera el ticket y el sistema libera automáticamente la mesa.',
            icon: CircleDollarSign,
        },
    ];

    return (
        <>
            <Head title="Sistema de Gestión de Restaurante" />

            <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
                {/* Navbar */}
                <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                                <UtensilsCrossed className="size-5" />
                            </div>
                            <div>
                                <span className="text-base font-bold tracking-tight">
                                    RestoApp
                                </span>
                                <span className="ml-2 hidden rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary sm:inline-block">
                                    POS & KDS Gastronómico
                                </span>
                            </div>
                        </div>

                        <nav className="flex items-center gap-3">
                            {auth.user ? (
                                <Button
                                    asChild
                                    size="sm"
                                    className="gap-2 font-semibold"
                                >
                                    <Link href={dashboard()}>
                                        <LayoutDashboard className="size-4" />
                                        Ir al Panel
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href={login()}>
                                            Iniciar Sesión
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        size="sm"
                                        className="gap-1.5 font-semibold"
                                    >
                                        <Link href={register()}>
                                            <LogIn className="size-4" />
                                            Registrarse
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative overflow-hidden border-b bg-gradient-to-b from-muted/30 to-background py-16 sm:py-24">
                    <div className="container mx-auto max-w-7xl space-y-6 px-4 text-center sm:px-6 lg:px-8">
                        <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
                            <Sparkles className="size-3.5 text-primary" />
                            <span>
                                Flujo Gastronómico Integral de Extremo a Extremo
                            </span>
                        </div>

                        <h1 className="mx-auto max-w-4xl text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                            Control total para tu restaurante:
                            <span className="mt-1 block bg-linear-to-r from-primary via-warning to-destructive bg-clip-text text-transparent">
                                Salón, Cocina KDS y Caja
                            </span>
                        </h1>

                        <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                            Diseñado para la operativa real: asignación de mesas
                            con comensales, control estricto de porciones en
                            menú diario, pantalla de despacho para cocina,
                            inventario físico y cobro multi-método con
                            liberación automática de mesas.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                            {auth.user ? (
                                <Button
                                    asChild
                                    size="lg"
                                    className="gap-2 px-8 font-semibold shadow-md"
                                >
                                    <Link href={dashboard()}>
                                        <LayoutDashboard className="size-5" />
                                        Entrar al Sistema
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        asChild
                                        size="lg"
                                        className="gap-2 px-8 font-semibold shadow-md"
                                    >
                                        <Link href={login()}>
                                            <LogIn className="size-5" />
                                            Acceder al Sistema
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="lg"
                                        className="px-6"
                                    >
                                        <Link href={register()}>
                                            Crear Cuenta
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Quick highlights bar */}
                        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 pt-10 text-left sm:grid-cols-4">
                            <div className="rounded-xl border bg-card p-4 shadow-sm">
                                <div className="text-2xl font-bold text-primary">
                                    100%
                                </div>
                                <div className="mt-0.5 text-xs text-muted-foreground">
                                    Control de Porciones
                                </div>
                            </div>
                            <div className="rounded-xl border bg-card p-4 shadow-sm">
                                <div className="text-2xl font-bold text-warning">
                                    FIFO
                                </div>
                                <div className="mt-0.5 text-xs text-muted-foreground">
                                    Despacho KDS Cocina
                                </div>
                            </div>
                            <div className="rounded-xl border bg-card p-4 shadow-sm">
                                <div className="text-2xl font-bold text-success">
                                    Atómico
                                </div>
                                <div className="mt-0.5 text-xs text-muted-foreground">
                                    Cierre y Liberación
                                </div>
                            </div>
                            <div className="rounded-xl border bg-card p-4 shadow-sm">
                                <div className="text-2xl font-bold text-info">
                                    Multi-Pago
                                </div>
                                <div className="mt-0.5 text-xs text-muted-foreground">
                                    Efectivo, POS, Yape/Plin
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Workflow Section */}
                <section className="border-b bg-muted/10 py-16 sm:py-20">
                    <div className="container mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl space-y-3 text-center">
                            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                Flujo de Atención Paso a Paso
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Cada etapa del servicio se sincroniza de forma
                                atómica y en tiempo real.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {workflowSteps.map((s) => {
                                const Icon = s.icon;
                                return (
                                    <div
                                        key={s.step}
                                        className="relative flex flex-col justify-between space-y-4 rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary">
                                                    <Icon className="size-5" />
                                                </div>
                                                <span className="text-2xl font-black text-muted-foreground/30">
                                                    {s.step}
                                                </span>
                                            </div>
                                            <h3 className="text-base font-bold text-foreground">
                                                {s.title}
                                            </h3>
                                            <p className="text-xs leading-relaxed text-muted-foreground">
                                                {s.desc}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Modules Grid Section */}
                <section className="py-16 sm:py-24">
                    <div className="container mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl space-y-3 text-center">
                            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                Módulos Integrados del Sistema
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Funcionalidades completas para coordinar salón,
                                cocina, caja y almacén sin errores.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {modules.map((m) => {
                                const Icon = m.icon;
                                return (
                                    <div
                                        key={m.title}
                                        className="group flex flex-col justify-between space-y-4 rounded-2xl border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div
                                                    className={`flex size-10 items-center justify-center rounded-xl border ${m.color}`}
                                                >
                                                    <Icon className="size-5" />
                                                </div>
                                                <span className="rounded-full border bg-muted/40 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                                    {m.badge}
                                                </span>
                                            </div>

                                            <h3 className="text-base font-bold text-foreground transition-colors group-hover:text-primary">
                                                {m.title}
                                            </h3>

                                            <p className="text-xs leading-relaxed text-muted-foreground">
                                                {m.description}
                                            </p>
                                        </div>

                                        {auth.user && (
                                            <Link
                                                href={m.href}
                                                className="inline-flex items-center gap-1.5 pt-2 text-xs font-semibold text-primary hover:underline"
                                            >
                                                <span>Acceder al módulo</span>
                                                <ArrowRight className="size-3.5" />
                                            </Link>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="mt-auto border-t bg-muted/20 py-8">
                    <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
                        <div className="flex items-center gap-2">
                            <UtensilsCrossed className="size-4 text-primary" />
                            <span className="font-semibold text-foreground">
                                RestoApp
                            </span>
                            <span>— Sistema de Gestión de Restaurante</span>
                        </div>

                        <div className="flex items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="transition-colors hover:text-foreground"
                                >
                                    Panel de Control
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="transition-colors hover:text-foreground"
                                    >
                                        Iniciar Sesión
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="transition-colors hover:text-foreground"
                                    >
                                        Registrarse
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
