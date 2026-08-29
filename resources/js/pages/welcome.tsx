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
            color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
            href: '/tables',
            badge: 'Salón',
        },
        {
            title: 'Menú Diario y Modalidades',
            description:
                'Configuración por fecha (Perú) de modalidades: Menú completo, Solo segundo y Entrada + postre, con stock de porciones.',
            icon: UtensilsCrossed,
            color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
            href: '/daily-menu',
            badge: 'Cocina / Menú',
        },
        {
            title: 'Comandas Progresivas',
            description:
                'Toma de múltiples pedidos durante la misma atención sin duplicar cuentas, guardando componentes y notas exactas.',
            icon: Utensils,
            color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
            href: '/orders',
            badge: 'Mozos',
        },
        {
            title: 'Cocina en Tiempo Real (KDS)',
            description:
                'Monitor de preparación FIFO para cocineros con filtrado inteligente: solo platos preparados, bebidas despachadas.',
            icon: ChefHat,
            color: 'text-red-500 bg-red-500/10 border-red-500/20',
            href: '/kitchen',
            badge: 'KDS Cocina',
        },
        {
            title: 'Módulo de Caja y Cobro',
            description:
                'Turnos con fondo inicial, cobros multi-método (Efectivo, Tarjeta, Yape, Plin), cálculo de vuelto y arqueo con cuadre.',
            icon: CircleDollarSign,
            color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
            href: '/cash-register',
            badge: 'Caja',
        },
        {
            title: 'Cierre Post-Pago Atómico',
            description:
                'Al cubrir el 100% de la cuenta, en una sola transacción se cierra la sesión, se completan comandas y se libera la mesa.',
            icon: CheckCircle2,
            color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
            href: '/bills',
            badge: 'Automatización',
        },
        {
            title: 'Inventario y Auditoría',
            description:
                'Trazabilidad en tiempo real con stock_movements, control de stock de bebidas y cancelaciones justificadas con motivo.',
            icon: Package,
            color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
            href: '/product-stock',
            badge: 'Almacén',
        },
        {
            title: 'Roles y Seguridad',
            description:
                'Perfiles especializados para Administrador, Mozo, Cocina y Cajero con permisos a nivel de controlador e interfaz.',
            icon: ShieldCheck,
            color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
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

            <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground">
                {/* Navbar */}
                <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                                <UtensilsCrossed className="size-5" />
                            </div>
                            <div>
                                <span className="text-base font-bold tracking-tight">RestoApp</span>
                                <span className="hidden sm:inline-block ml-2 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                                    POS & KDS Gastronómico
                                </span>
                            </div>
                        </div>

                        <nav className="flex items-center gap-3">
                            {auth.user ? (
                                <Button asChild size="sm" className="gap-2 font-semibold">
                                    <Link href={dashboard()}>
                                        <LayoutDashboard className="size-4" />
                                        Ir al Panel
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href={login()}>Iniciar Sesión</Link>
                                    </Button>
                                    <Button asChild size="sm" className="gap-1.5 font-semibold">
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
                <section className="relative overflow-hidden py-16 sm:py-24 border-b bg-gradient-to-b from-muted/30 to-background">
                    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
                            <Sparkles className="size-3.5 text-primary" />
                            <span>Flujo Gastronómico Integral de Extremo a Extremo</span>
                        </div>

                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl max-w-4xl mx-auto leading-tight">
                            Control total para tu restaurante:
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-500 to-orange-500 block mt-1">
                                Salón, Cocina KDS y Caja
                            </span>
                        </h1>

                        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Diseñado para la operativa real: asignación de mesas con comensales, control estricto de porciones en menú diario, pantalla de despacho para cocina, inventario físico y cobro multi-método con liberación automática de mesas.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                            {auth.user ? (
                                <Button asChild size="lg" className="gap-2 font-semibold shadow-md px-8">
                                    <Link href={dashboard()}>
                                        <LayoutDashboard className="size-5" />
                                        Entrar al Sistema
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild size="lg" className="gap-2 font-semibold shadow-md px-8">
                                        <Link href={login()}>
                                            <LogIn className="size-5" />
                                            Acceder al Sistema
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="lg" className="px-6">
                                        <Link href={register()}>Crear Cuenta</Link>
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Quick highlights bar */}
                        <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
                            <div className="rounded-xl border bg-card p-4 shadow-sm">
                                <div className="text-2xl font-bold text-primary">100%</div>
                                <div className="text-xs text-muted-foreground mt-0.5">Control de Porciones</div>
                            </div>
                            <div className="rounded-xl border bg-card p-4 shadow-sm">
                                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">FIFO</div>
                                <div className="text-xs text-muted-foreground mt-0.5">Despacho KDS Cocina</div>
                            </div>
                            <div className="rounded-xl border bg-card p-4 shadow-sm">
                                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Atómico</div>
                                <div className="text-xs text-muted-foreground mt-0.5">Cierre y Liberación</div>
                            </div>
                            <div className="rounded-xl border bg-card p-4 shadow-sm">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">Multi-Pago</div>
                                <div className="text-xs text-muted-foreground mt-0.5">Efectivo, POS, Yape/Plin</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Workflow Section */}
                <section className="py-16 sm:py-20 border-b bg-muted/10">
                    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
                        <div className="text-center space-y-3 max-w-2xl mx-auto">
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                Flujo de Atención Paso a Paso
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Cada etapa del servicio se sincroniza de forma atómica y en tiempo real.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {workflowSteps.map((s) => {
                                const Icon = s.icon;
                                return (
                                    <div
                                        key={s.step}
                                        className="relative rounded-2xl border bg-card p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                                                    <Icon className="size-5" />
                                                </div>
                                                <span className="text-2xl font-black text-muted-foreground/30">
                                                    {s.step}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-base text-foreground">{s.title}</h3>
                                            <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Modules Grid Section */}
                <section className="py-16 sm:py-24">
                    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
                        <div className="text-center space-y-3 max-w-2xl mx-auto">
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                Módulos Integrados del Sistema
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Funcionalidades completas para coordinar salón, cocina, caja y almacén sin errores.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {modules.map((m) => {
                                const Icon = m.icon;
                                return (
                                    <div
                                        key={m.title}
                                        className="group rounded-2xl border bg-card p-6 shadow-sm hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className={`flex size-10 items-center justify-center rounded-xl border ${m.color}`}>
                                                    <Icon className="size-5" />
                                                </div>
                                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border rounded-full px-2 py-0.5 bg-muted/40">
                                                    {m.badge}
                                                </span>
                                            </div>

                                            <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                                                {m.title}
                                            </h3>

                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                {m.description}
                                            </p>
                                        </div>

                                        {auth.user && (
                                            <Link
                                                href={m.href}
                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary pt-2 hover:underline"
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
                    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <UtensilsCrossed className="size-4 text-primary" />
                            <span className="font-semibold text-foreground">RestoApp</span>
                            <span>— Sistema de Gestión de Restaurante</span>
                        </div>

                        <div className="flex items-center gap-4">
                            {auth.user ? (
                                <Link href={dashboard()} className="hover:text-foreground transition-colors">
                                    Panel de Control
                                </Link>
                            ) : (
                                <>
                                    <Link href={login()} className="hover:text-foreground transition-colors">
                                        Iniciar Sesión
                                    </Link>
                                    <Link href={register()} className="hover:text-foreground transition-colors">
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
