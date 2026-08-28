import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Banknote,
    ChefHat,
    CircleDollarSign,
    Clock,
    CreditCard,
    DollarSign,
    Plus,
    ReceiptText,
    Sparkles,
    Table2,
    TrendingUp,
    Utensils,
    UtensilsCrossed,
} from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Order } from '@/types/restaurant';

type DashboardMetrics = {
    today_sales: number;
    today_sales_cash: number;
    today_sales_card: number;
    today_sales_digital: number;
    occupied_tables: number;
    total_tables: number;
    pending_kitchen_items: number;
    pending_bills_count: number;
    pending_bills_balance: number;
};

type Props = {
    metrics: DashboardMetrics;
    recentOrders: Order[];
};

function formatCurrency(amount: number): string {
    return `S/. ${Number(amount).toFixed(2)}`;
}

function formatTime(dateString: string): string {
    return new Intl.DateTimeFormat('es-PE', {
        timeStyle: 'short',
        timeZone: 'America/Lima',
    }).format(new Date(dateString));
}

export default function Dashboard({ metrics, recentOrders }: Props) {
    const occupancyRate = metrics.total_tables > 0
        ? Math.round((metrics.occupied_tables / metrics.total_tables) * 100)
        : 0;

    return (
        <>
            <Head title="Panel de Control" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <PageHeader
                        title="Panel de Control"
                        description="Vista general operativa en tiempo real del restaurante."
                    />

                    <div className="flex flex-wrap gap-2">
                        <Button asChild size="sm" variant="default" className="gap-1.5">
                            <Link href="/tables">
                                <Table2 className="size-4" />
                                Abrir Mesa
                            </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline" className="gap-1.5">
                            <Link href="/kitchen">
                                <ChefHat className="size-4" />
                                Monitor Cocina
                            </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline" className="gap-1.5">
                            <Link href="/cash-register">
                                <CircleDollarSign className="size-4" />
                                Caja
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Métricas Principales */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Ventas de Hoy */}
                    <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Ventas Cobradas Hoy
                            </span>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                                <TrendingUp className="size-4" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">
                                {formatCurrency(metrics.today_sales)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Efectivo: {formatCurrency(metrics.today_sales_cash)} · Digital: {formatCurrency(metrics.today_sales_digital + metrics.today_sales_card)}
                            </p>
                        </div>
                    </div>

                    {/* Ocupación de Mesas */}
                    <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Ocupación de Salón
                            </span>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Table2 className="size-4" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">
                                {metrics.occupied_tables} / {metrics.total_tables}{' '}
                                <span className="text-sm font-normal text-muted-foreground">
                                    mesas ({occupancyRate}%)
                                </span>
                            </p>
                            <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                                <div
                                    className="bg-primary h-1.5 rounded-full transition-all"
                                    style={{ width: `${occupancyRate}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Cocina Pendiente */}
                    <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Cocina (KDS)
                            </span>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                                <ChefHat className="size-4" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                {metrics.pending_kitchen_items}{' '}
                                <span className="text-sm font-normal text-muted-foreground">
                                    platos por preparar
                                </span>
                            </p>
                            <Button asChild variant="link" className="p-0 h-auto text-xs text-amber-600 dark:text-amber-400 mt-1">
                                <Link href="/kitchen" className="inline-flex items-center gap-1">
                                    Ver pedidos en cocina <ArrowRight className="size-3" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Cuentas por Cobrar */}
                    <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Por Cobrar en Caja
                            </span>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                                <ReceiptText className="size-4" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {formatCurrency(metrics.pending_bills_balance)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                En {metrics.pending_bills_count} cuentas abiertas
                            </p>
                        </div>
                    </div>
                </div>

                {/* Accesos Rápidos y Actividad */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Accesos de Flujo Operativo */}
                    <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
                        <h3 className="font-semibold text-base flex items-center gap-2">
                            <Sparkles className="size-4 text-primary" /> Flujo Operativo
                        </h3>

                        <div className="space-y-2">
                            <Link
                                href="/daily-menu"
                                className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/40 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <UtensilsCrossed className="size-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">1. Configurar Menú del Día</p>
                                        <p className="text-xs text-muted-foreground">Platos, porciones y modalidades de hoy</p>
                                    </div>
                                </div>
                                <ArrowRight className="size-4 text-muted-foreground" />
                            </Link>

                            <Link
                                href="/tables"
                                className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/40 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                                        <Table2 className="size-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">2. Salón y Mesas</p>
                                        <p className="text-xs text-muted-foreground">Abrir mesa y asignar mozo</p>
                                    </div>
                                </div>
                                <ArrowRight className="size-4 text-muted-foreground" />
                            </Link>

                            <Link
                                href="/orders"
                                className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/40 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                                        <Utensils className="size-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">3. Tomar Comandas</p>
                                        <p className="text-xs text-muted-foreground">Pedidos progresivos por mesa</p>
                                    </div>
                                </div>
                                <ArrowRight className="size-4 text-muted-foreground" />
                            </Link>

                            <Link
                                href="/cash-register"
                                className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/40 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                                        <CircleDollarSign className="size-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">4. Caja y Cobro</p>
                                        <p className="text-xs text-muted-foreground">Cobrar y liberar mesa automáticamente</p>
                                    </div>
                                </div>
                                <ArrowRight className="size-4 text-muted-foreground" />
                            </Link>
                        </div>
                    </div>

                    {/* Últimas Comandas Registradas */}
                    <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4 lg:col-span-2">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-base flex items-center gap-2">
                                <Clock className="size-4 text-muted-foreground" /> Comandas Recientes
                            </h3>
                            <Button asChild variant="link" size="sm" className="text-xs p-0 h-auto">
                                <Link href="/orders">Ver todas</Link>
                            </Button>
                        </div>

                        <div className="space-y-2.5">
                            {recentOrders.map((order) => {
                                const tableNum = order.bill?.restaurant_table?.number;
                                const itemsCount = (order.items ?? []).filter((i) => !i.is_cancelled).length;

                                return (
                                    <div
                                        key={order.id}
                                        className="flex items-center justify-between rounded-lg border p-3 text-sm hover:bg-muted/20 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-8 items-center justify-center rounded-lg bg-muted font-bold text-xs">
                                                #{order.id}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground">
                                                    {tableNum ? `Mesa #${tableNum}` : 'Para llevar'}
                                                    <span className="font-normal text-muted-foreground text-xs ml-2">
                                                        · {itemsCount} {itemsCount === 1 ? 'ítem' : 'ítems'}
                                                    </span>
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Mozo: {order.user?.name ?? 'Sin mozo'} · {formatTime(order.created_at)}
                                                </p>
                                            </div>
                                        </div>

                                        <Badge
                                            variant="outline"
                                            className={
                                                order.status === 'completado'
                                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs'
                                                    : order.status === 'enviado_cocina'
                                                    ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 text-xs'
                                                    : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 text-xs'
                                            }
                                        >
                                            {order.status === 'enviado_cocina'
                                                ? 'En cocina'
                                                : order.status === 'completado'
                                                ? 'Completado'
                                                : 'Pendiente'}
                                        </Badge>
                                    </div>
                                );
                            })}

                            {recentOrders.length === 0 && (
                                <p className="py-8 text-center text-xs text-muted-foreground">
                                    No hay comandas registradas el día de hoy.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
    ],
};
