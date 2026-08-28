import { Form, Head } from '@inertiajs/react';
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
        (new Date().getTime() - new Date(dateString).getTime()) / (1000 * 60)
    );
    if (elapsedMinutes < 1) return 'Hace un momento';
    if (elapsedMinutes === 1) return 'Hace 1 minuto';
    return `Hace ${elapsedMinutes} min`;
}

export default function KitchenIndex({ orders }: Props) {
    const [filter, setFilter] = useState<'all' | 'pendiente' | 'en_preparacion'>('all');

    const filteredOrders = orders
        .map((order) => {
            const kitchenItems = (order.items ?? []).filter((item) => {
                if (filter === 'all') {
                    return item.kitchen_status === 'pendiente' || item.kitchen_status === 'en_preparacion';
                }
                return item.kitchen_status === filter;
            });
            return { ...order, kitchenItems };
        })
        .filter((order) => order.kitchenItems.length > 0);

    const totalPendingItems = orders.reduce(
        (sum, o) => sum + (o.items ?? []).filter((i) => i.kitchen_status === 'pendiente').length,
        0
    );
    const totalPreparingItems = orders.reduce(
        (sum, o) => sum + (o.items ?? []).filter((i) => i.kitchen_status === 'en_preparacion').length,
        0
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
                            <span className="text-xs font-semibold">{totalPendingItems} Por preparar</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg border bg-blue-500/10 px-3 py-1.5 text-blue-700 dark:text-blue-400">
                            <Flame className="size-4" />
                            <span className="text-xs font-semibold">{totalPreparingItems} En cocción</span>
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
                        variant={filter === 'pendiente' ? 'default' : 'outline'}
                        onClick={() => setFilter('pendiente')}
                        className="text-xs"
                    >
                        Solo Pendientes ({totalPendingItems})
                    </Button>
                    <Button
                        size="sm"
                        variant={filter === 'en_preparacion' ? 'default' : 'outline'}
                        onClick={() => setFilter('en_preparacion')}
                        className="text-xs"
                    >
                        En Preparación ({totalPreparingItems})
                    </Button>
                </div>

                {/* Tablero KDS */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredOrders.map((order) => {
                        const tableNum = order.bill?.restaurant_table?.number;

                        return (
                            <div
                                key={order.id}
                                className="flex flex-col justify-between rounded-xl border bg-card shadow-sm transition-all hover:shadow-md"
                            >
                                <div>
                                    {/* Encabezado Comanda */}
                                    <div className="flex items-center justify-between border-b p-3 bg-muted/30">
                                        <div className="flex items-center gap-2">
                                            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary text-sm">
                                                #{order.id}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm leading-tight">
                                                    {tableNum ? `Mesa #${tableNum}` : 'Para llevar'}
                                                </h4>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Mozo: {order.user?.name ?? 'Sin mozo'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                                <Clock className="size-3" />
                                                <span>{formatTime(order.created_at)}</span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground">
                                                {getTimeElapsed(order.created_at)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Platos a preparar */}
                                    <div className="p-3 space-y-3">
                                        {order.kitchenItems.map((item: OrderItem) => {
                                            const isPreparing = item.kitchen_status === 'en_preparacion';
                                            const components = item.daily_menu_products ?? [];

                                            return (
                                                <div
                                                    key={item.id}
                                                    className={`rounded-lg border p-3 space-y-2 transition-colors ${
                                                        isPreparing
                                                            ? 'border-blue-300 bg-blue-50/20 dark:border-blue-900/50'
                                                            : 'bg-muted/10'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <p className="font-bold text-sm text-foreground">
                                                                {item.quantity}x {item.product?.name ?? item.menu_modality?.name ?? 'Plato'}
                                                            </p>
                                                        </div>

                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                isPreparing
                                                                    ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300'
                                                                    : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300'
                                                            }
                                                        >
                                                            {isPreparing ? 'En preparación' : 'Pendiente'}
                                                        </Badge>
                                                    </div>

                                                    {/* Desglose de Componentes (Segundo, Entrada, Postre) */}
                                                    {components.length > 0 && (
                                                        <div className="space-y-1 rounded bg-background/90 p-2 text-xs border border-dashed">
                                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                                Componentes:
                                                            </span>
                                                            {components.map((comp) => (
                                                                <div key={comp.id} className="flex items-center gap-1.5 text-foreground font-medium">
                                                                    <span className="size-1.5 rounded-full bg-primary" />
                                                                    <span>
                                                                        <strong className="text-muted-foreground">{comp.product?.menu_subcategory_type?.name ?? 'Item'}:</strong>{' '}
                                                                        {comp.product?.name}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Notas de Cocina */}
                                                    {item.notes && (
                                                        <div className="rounded bg-amber-500/10 p-2 text-xs text-amber-800 dark:text-amber-300 border border-amber-300/40">
                                                            <strong>Nota:</strong> "{item.notes}"
                                                        </div>
                                                    )}

                                                    {/* Acciones de Cocinero */}
                                                    <div className="pt-1">
                                                        <Form
                                                            action={`/kitchen/items/${item.id}/status`}
                                                            method="patch"
                                                            className="w-full"
                                                        >
                                                            {({ processing }) => (
                                                                <>
                                                                    <input
                                                                        type="hidden"
                                                                        name="kitchen_status"
                                                                        value={isPreparing ? 'listo' : 'en_preparacion'}
                                                                    />
                                                                    <Button
                                                                        type="submit"
                                                                        size="sm"
                                                                        className={`w-full text-xs font-semibold gap-1.5 ${
                                                                            isPreparing
                                                                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                                                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                                        }`}
                                                                        disabled={processing}
                                                                    >
                                                                        {isPreparing ? (
                                                                            <>
                                                                                <CheckCircle2 className="size-3.5" />
                                                                                Marcar como Listo
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Flame className="size-3.5" />
                                                                                Empezar a Preparar
                                                                            </>
                                                                        )}
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </Form>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredOrders.length === 0 && (
                        <div className="col-span-full py-16 text-center rounded-xl border bg-background text-muted-foreground space-y-2">
                            <ChefHat className="size-10 mx-auto text-muted-foreground/50" />
                            <p className="font-medium text-base">¡Cocina al día!</p>
                            <p className="text-xs text-muted-foreground">No hay platos pendientes ni en preparación en este momento.</p>
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
