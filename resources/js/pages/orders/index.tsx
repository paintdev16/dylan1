import { Head } from '@inertiajs/react';
import {
    AlertCircle,
    Clock,
    Plus,
    ShoppingBag,
    UtensilsCrossed,
} from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { TableOrderSheet } from '@/pages/orders/table-order-sheet';
import { index as indexRoute } from '@/routes/orders';
import {
    DailyMenuProduct,
    MenuModality,
    Order,
    OrderItem,
    Product,
    RestaurantTable,
} from '@/types/restaurant';

type Props = {
    orders: Order[];
    tables: RestaurantTable[];
    products: Product[];
    menuModalities: MenuModality[];
    dailyMenuProducts?: DailyMenuProduct[];
};

function formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('es-PE', {
        timeStyle: 'short',
        timeZone: 'America/Lima',
    }).format(new Date(dateString));
}

function formatCurrency(amount: number): string {
    return `S/. ${amount.toFixed(2)}`;
}

function getOrderStatusBadge(status: string, items: OrderItem[]) {
    if (
        items.length > 0 &&
        items.every((item) => item.kitchen_status === 'delivered')
    ) {
        status = 'completed';
    }

    switch (status) {
        case 'pending':
            return (
                <Badge
                    variant="outline"
                    className="border-amber-300 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                >
                    Pendiente
                </Badge>
            );
        case 'sent_to_kitchen':
            return (
                <Badge
                    variant="outline"
                    className="border-blue-300 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                >
                    En Cocina
                </Badge>
            );
        case 'completed':
            return (
                <Badge
                    variant="outline"
                    className="border-emerald-300 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                >
                    Completado
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

function getKitchenStatusLabel(status: string) {
    switch (status) {
        case 'pending':
            return {
                text: 'En cola',
                class: 'bg-amber-50 text-amber-700 border-amber-200',
                next: 'in_preparation',
                nextText: 'Preparar',
            };
        case 'in_preparation':
            return {
                text: 'En preparación',
                class: 'bg-blue-50 text-blue-700 border-blue-200',
                next: 'ready',
                nextText: 'Listo',
            };
        case 'ready':
            return {
                text: 'Listo para servir',
                class: 'bg-purple-50 text-purple-700 border-purple-200',
                next: 'delivered',
                nextText: 'Entregar',
            };
        case 'delivered':
            return {
                text: 'Entregado',
                class: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                next: null,
                nextText: null,
            };
        default:
            return { text: status, class: '', next: null, nextText: null };
    }
}

export default function Index({
    orders,
    tables,
    products,
    menuModalities,
    dailyMenuProducts = [],
}: Props) {
    const [statusFilter, setStatusFilter] = useState<
        'todos' | 'pending' | 'sent_to_kitchen' | 'completed'
    >('todos');
    const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(
        null,
    );

    const filteredOrders = orders.filter((o) => {
        if (statusFilter === 'todos') {
            return true;
        }
        return o.status === statusFilter;
    });

    const groupedOrders = Object.values(
        filteredOrders.reduce<Record<string, Order>>((groups, order) => {
            const key = order.bill_id
                ? `bill-${order.bill_id}`
                : `order-${order.id}`;
            const current = groups[key];

            if (!current) {
                groups[key] = { ...order, items: [...(order.items ?? [])] };
                return groups;
            }

            current.items = [...(current.items ?? []), ...(order.items ?? [])];
            if (new Date(order.created_at) < new Date(current.created_at)) {
                current.created_at = order.created_at;
            }
            return groups;
        }, {}),
    );

    return (
        <>
            <Head title="Comandas / Pedidos" />

            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <PageHeader
                        title="Comandas / Pedidos"
                        description="Gestiona las comandas tomadas por mozos, sus platos y el flujo de preparación."
                    />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                    {tables.map((table) => (
                        <button
                            key={table.id}
                            type="button"
                            disabled={table.status === 'out_of_service'}
                            onClick={() => setSelectedTable(table)}
                            className={`rounded-xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 ${table.status === 'occupied' ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/20' : table.status === 'available' ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20' : 'bg-muted'}`}
                        >
                            <p className="text-lg font-bold">
                                Mesa {table.number}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Capacidad: {table.capacity}
                            </p>
                            <p className="mt-2 text-xs font-medium">
                                {table.status === 'available'
                                    ? 'Disponible'
                                    : table.status === 'occupied'
                                      ? `Ocupada · S/. ${Number(table.active_session?.bill?.total_amount ?? 0).toFixed(2)}`
                                      : 'Fuera de servicio'}
                            </p>
                        </button>
                    ))}
                </div>

                {/* Filtros de estado */}
                <div className="flex flex-wrap gap-2">
                    {(
                        [
                            'todos',
                            'pending',
                            'sent_to_kitchen',
                            'completed',
                        ] as const
                    ).map((st) => (
                        <Button
                            key={st}
                            variant={
                                statusFilter === st ? 'default' : 'outline'
                            }
                            size="sm"
                            onClick={() => setStatusFilter(st)}
                            className="text-xs capitalize"
                        >
                            {st === 'todos'
                                ? 'Todos los Pedidos'
                                : st.replace('_', ' ')}
                            <span className="ml-1.5 rounded-full bg-muted/30 px-1.5 py-0.5 text-[10px]">
                                {st === 'todos'
                                    ? orders.length
                                    : orders.filter((o) => o.status === st)
                                          .length}
                            </span>
                        </Button>
                    ))}
                </div>

                {/* Grid de Comandas */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {groupedOrders.map((order) => {
                        const items = order.items ?? [];
                        const totalAmount = items.reduce(
                            (sum, item) => sum + Number(item.subtotal),
                            0,
                        );
                        const tableNumber =
                            order.bill?.restaurant_table?.number;

                        return (
                            <div
                                key={`bill-${order.bill_id}`}
                                className="flex flex-col justify-between rounded-xl border bg-card shadow-sm transition-all hover:shadow-md"
                            >
                                <div>
                                    {/* Header de Comanda */}
                                    <div className="flex items-center justify-between border-b p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                                                #{order.id}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5 text-sm font-semibold">
                                                    <span>
                                                        {tableNumber
                                                            ? `Mesa ${tableNumber}`
                                                            : 'Para llevar'}
                                                    </span>
                                                    <span className="text-xs font-normal text-muted-foreground">
                                                        (Cta #{order.bill_id})
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                    <Clock className="size-3" />
                                                    <span>
                                                        {formatDate(
                                                            order.created_at,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {getOrderStatusBadge(
                                            order.status,
                                            items,
                                        )}
                                    </div>

                                    {/* Lista de Ítems */}
                                    <div className="space-y-3 p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Mesero:{' '}
                                            <span className="font-medium text-foreground">
                                                {order.user?.name ??
                                                    'Sin usuario'}
                                            </span>
                                        </p>

                                        <div className="space-y-2">
                                            {items.length > 0 ? (
                                                items.map((item) => {
                                                    const kitchenInfo =
                                                        getKitchenStatusLabel(
                                                            item.kitchen_status,
                                                        );
                                                    const componentNames =
                                                        item.daily_menu_products
                                                            ?.map(
                                                                (d) =>
                                                                    d.product
                                                                        ?.name,
                                                            )
                                                            .filter(Boolean);

                                                    return (
                                                        <div
                                                            key={item.id}
                                                            className="flex items-center justify-between rounded-lg border bg-muted/10 p-2.5 text-xs"
                                                        >
                                                            <div className="max-w-[60%] space-y-0.5">
                                                                <p className="font-semibold text-foreground">
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
                                                                        'Item'}
                                                                </p>
                                                                {componentNames &&
                                                                    componentNames.length >
                                                                        0 && (
                                                                        <p className="text-[11px] font-medium text-primary/80">
                                                                            (
                                                                            {componentNames.join(
                                                                                ' + ',
                                                                            )}
                                                                            )
                                                                        </p>
                                                                    )}
                                                                {item.notes && (
                                                                    <p className="text-[11px] text-amber-700 italic dark:text-amber-400">
                                                                        "
                                                                        {
                                                                            item.notes
                                                                        }
                                                                        "
                                                                    </p>
                                                                )}
                                                                <p className="text-[11px] text-muted-foreground">
                                                                    {formatCurrency(
                                                                        Number(
                                                                            item.subtotal,
                                                                        ),
                                                                    )}
                                                                </p>
                                                            </div>

                                                            <div className="flex items-center gap-1.5">
                                                                <Badge
                                                                    variant="outline"
                                                                    className={
                                                                        kitchenInfo.class
                                                                    }
                                                                >
                                                                    {
                                                                        kitchenInfo.text
                                                                    }
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="rounded-lg border border-dashed py-4 text-center text-xs text-muted-foreground">
                                                    Sin productos en esta
                                                    comanda.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer de Comanda */}
                                <div className="space-y-3 border-t bg-muted/20 p-4">
                                    <div className="flex items-center justify-between text-xs font-semibold">
                                        <span className="text-muted-foreground">
                                            Subtotal Comanda:
                                        </span>
                                        <span className="text-sm font-bold text-primary">
                                            {formatCurrency(totalAmount)}
                                        </span>
                                    </div>

                                    {/* Acciones principales de la comanda */}
                                    <div className="flex items-center gap-2"></div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredOrders.length === 0 && (
                        <div className="col-span-full space-y-2 rounded-xl border bg-background py-12 text-center text-muted-foreground">
                            <AlertCircle className="mx-auto size-8 text-muted-foreground/60" />
                            <p className="text-sm font-medium">
                                No hay comandas registradas en este estado.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <TableOrderSheet
                table={selectedTable}
                products={products}
                modalities={menuModalities}
                dailyMenuProducts={dailyMenuProducts}
                open={selectedTable !== null}
                onOpenChange={(open) => {
                    if (!open) setSelectedTable(null);
                }}
            />
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Comandas',
            href: indexRoute(),
        },
    ],
};
