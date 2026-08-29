import { Form, Head, usePoll } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    ChefHat,
    Clock,
    Flame,
    Utensils,
} from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Order, OrderItem } from '@/types/restaurant';

type Props = {
    orders: Order[];
};

function formatTime(dateString: string): string {
    return new Intl.DateTimeFormat('es-PE', {
        timeStyle: 'short',
        timeZone: 'America/Lima',
    }).format(new Date(dateString));
}

function getTimeElapsed(dateString: string): string {
    const elapsedMinutes = Math.floor(
        (new Date().getTime() - new Date(dateString).getTime()) / (1000 * 60),
    );
    if (elapsedMinutes < 1) return 'Hace un momento';
    if (elapsedMinutes === 1) return 'Hace 1 minuto';
    return `Hace ${elapsedMinutes} min`;
}

export default function KitchenIndex({ orders }: Props) {
    usePoll(5000, { only: ['orders', 'flash'] });
    const [filter, setFilter] = useState<'all' | 'pending' | 'in_preparation'>(
        'all',
    );

    const filteredOrders = orders
        .map((order) => {
            const kitchenItems = (order.items ?? []).filter((item) => {
                if (filter === 'all') {
                    return (
                        item.kitchen_status === 'pending' ||
                        item.kitchen_status === 'in_preparation'
                    );
                }
                return item.kitchen_status === filter;
            });
            return { ...order, kitchenItems };
        })
        .filter((order) => order.kitchenItems.length > 0);

    const groupedOrders = Object.values(
        filteredOrders.reduce<Record<string, (typeof filteredOrders)[number]>>(
            (groups, order) => {
                const tableNumber = order.bill?.restaurant_table?.number;
                const key = tableNumber
                    ? `table-${tableNumber}`
                    : `order-${order.id}`;
                const current = groups[key];

                if (!current) {
                    groups[key] = {
                        ...order,
                        kitchenItems: [...order.kitchenItems],
                    };
                    return groups;
                }

                current.kitchenItems.push(...order.kitchenItems);
                if (new Date(order.created_at) < new Date(current.created_at)) {
                    current.created_at = order.created_at;
                }
                return groups;
            },
            {},
        ),
    );

    const totalPendingItems = orders.reduce(
        (sum, o) =>
            sum +
            (o.items ?? []).filter((i) => i.kitchen_status === 'pending')
                .length,
        0,
    );
    const totalPreparingItems = orders.reduce(
        (sum, o) =>
            sum +
            (o.items ?? []).filter((i) => i.kitchen_status === 'in_preparation')
                .length,
        0,
    );

    return (
        <>
            <Head title="Cocina (KDS)" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <PageHeader
                        title="Cocina (KDS)"
                        description="Pantalla de despacho y preparación de pedidos para cocina en tiempo real."
                    />

                    {/* Resumen rápido */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 rounded-lg border bg-amber-500/10 px-3 py-1.5 text-amber-700 dark:text-amber-400">
                            <Clock className="size-4" />
                            <span className="text-xs font-semibold">
                                {totalPendingItems} Por preparar
                            </span>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg border bg-blue-500/10 px-3 py-1.5 text-blue-700 dark:text-blue-400">
                            <Flame className="size-4" />
                            <span className="text-xs font-semibold">
                                {totalPreparingItems} En cocción
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant={filter === 'all' ? 'default' : 'outline'}
                        onClick={() => setFilter('all')}
                        className="text-xs"
                    >
                        Todos los platos activos
                    </Button>
                    <Button
                        size="sm"
                        variant={filter === 'pending' ? 'default' : 'outline'}
                        onClick={() => setFilter('pending')}
                        className="text-xs"
                    >
                        Solo Pendientes ({totalPendingItems})
                    </Button>
                    <Button
                        size="sm"
                        variant={
                            filter === 'in_preparation' ? 'default' : 'outline'
                        }
                        onClick={() => setFilter('in_preparation')}
                        className="text-xs"
                    >
                        En Preparación ({totalPreparingItems})
                    </Button>
                </div>

                {/* Tablero KDS */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {groupedOrders.map((order) => {
                        const tableNum = order.bill?.restaurant_table?.number;

                        return (
                            <div
                                key={order.id}
                                className="flex flex-col justify-between rounded-xl border bg-card shadow-sm transition-all hover:shadow-md"
                            >
                                <div>
                                    {/* Encabezado Comanda */}
                                    <div className="flex items-center justify-between border-b bg-muted/30 p-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                                                #{order.id}
                                            </div>
                                            <div>
                                                <h4 className="text-sm leading-tight font-bold">
                                                    {tableNum
                                                        ? `Mesa #${tableNum}`
                                                        : 'Para llevar'}
                                                </h4>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Mozo:{' '}
                                                    {order.user?.name ??
                                                        'Sin mozo'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                                <Clock className="size-3" />
                                                <span>
                                                    {formatTime(
                                                        order.created_at,
                                                    )}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground">
                                                {getTimeElapsed(
                                                    order.created_at,
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Platos a preparar */}
                                    <div className="space-y-3 p-3">
                                        {order.kitchenItems.map(
                                            (item: OrderItem) => {
                                                const isPreparing =
                                                    item.kitchen_status ===
                                                    'in_preparation';
                                                const components =
                                                    item.daily_menu_products ??
                                                    [];

                                                return (
                                                    <div
                                                        key={item.id}
                                                        className={`space-y-2 rounded-lg border p-3 transition-colors ${
                                                            isPreparing
                                                                ? 'border-blue-300 bg-blue-50/20 dark:border-blue-900/50'
                                                                : 'bg-muted/10'
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div>
                                                                <p className="text-sm font-bold text-foreground">
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                    x{' '}
                                                                    {item
                                                                        .product
                                                                        ?.name ??
                                                                        item
                                                                            .menu_modality
                                                                            ?.name ??
                                                                        'Plato'}
                                                                </p>
                                                            </div>

                                                            <Badge
                                                                variant="outline"
                                                                className={
                                                                    isPreparing
                                                                        ? 'border-blue-300 bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                                                                        : 'border-amber-300 bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                                                }
                                                            >
                                                                {isPreparing
                                                                    ? 'En preparación'
                                                                    : 'Pendiente'}
                                                            </Badge>
                                                        </div>

                                                        {/* Desglose de Componentes (Segundo, Entrada, Postre) */}
                                                        {components.length >
                                                            0 && (
                                                            <div className="space-y-1 rounded border border-dashed bg-background/90 p-2 text-xs">
                                                                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                                                    Componentes:
                                                                </span>
                                                                {components.map(
                                                                    (comp) => (
                                                                        <div
                                                                            key={
                                                                                comp.id
                                                                            }
                                                                            className="flex items-center gap-1.5 font-medium text-foreground"
                                                                        >
                                                                            <span className="size-1.5 rounded-full bg-primary" />
                                                                            <span>
                                                                                <strong className="text-muted-foreground">
                                                                                    {comp
                                                                                        .product
                                                                                        ?.menu_subcategory_type
                                                                                        ?.name ??
                                                                                        'Item'}

                                                                                    :
                                                                                </strong>{' '}
                                                                                {
                                                                                    comp
                                                                                        .product
                                                                                        ?.name
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    ),
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Notas de Cocina */}
                                                        {item.notes && (
                                                            <div className="rounded border border-amber-300/40 bg-amber-500/10 p-2 text-xs text-amber-800 dark:text-amber-300">
                                                                <strong>
                                                                    Nota:
                                                                </strong>{' '}
                                                                "{item.notes}"
                                                            </div>
                                                        )}

                                                        {/* Acciones de Cocinero */}
                                                        <div className="pt-1">
                                                            <Form
                                                                action={`/kitchen/items/${item.id}/status`}
                                                                method="patch"
                                                                className="w-full"
                                                            >
                                                                {({
                                                                    processing,
                                                                }) => (
                                                                    <>
                                                                        <input
                                                                            type="hidden"
                                                                            name="kitchen_status"
                                                                            value={
                                                                                isPreparing
                                                                                    ? 'delivered'
                                                                                    : 'in_preparation'
                                                                            }
                                                                        />
                                                                        <Button
                                                                            type="submit"
                                                                            size="sm"
                                                                            className={`w-full gap-1.5 text-xs font-semibold ${
                                                                                isPreparing
                                                                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                                                            }`}
                                                                            disabled={
                                                                                processing
                                                                            }
                                                                        >
                                                                            {isPreparing ? (
                                                                                <>
                                                                                    <CheckCircle2 className="size-3.5" />
                                                                                    Marcar
                                                                                    como
                                                                                    Listo
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <Flame className="size-3.5" />
                                                                                    Empezar
                                                                                    a
                                                                                    Preparar
                                                                                </>
                                                                            )}
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </Form>
                                                        </div>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredOrders.length === 0 && (
                        <div className="col-span-full space-y-2 rounded-xl border bg-background py-16 text-center text-muted-foreground">
                            <ChefHat className="mx-auto size-10 text-muted-foreground/50" />
                            <p className="text-base font-medium">
                                ¡Cocina al día!
                            </p>
                            <p className="text-xs text-muted-foreground">
                                No hay platos pendientes ni en preparación en
                                este momento.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

KitchenIndex.layout = {
    breadcrumbs: [
        {
            title: 'Cocina',
            href: '/kitchen',
        },
    ],
};
