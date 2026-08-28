import { Form, Head } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle,
    ChefHat,
    Clock,
    Plus,
    ShoppingBag,
    Trash2,
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
import { AddItemModal } from '@/pages/orders/add-item-modal';
import { CreateOrderModal } from '@/pages/orders/create-order-modal';
import { updateKitchenStatus as updateKitchenStatusRoute, destroy as destroyItemRoute } from '@/routes/order-items';
import { destroy as destroyOrderRoute, index as indexRoute, updateStatus as updateStatusRoute } from '@/routes/orders';
import { Bill, MenuModality, Order, OrderItem, Product } from '@/types/restaurant';

type Props = {
    orders: Order[];
    openBills: Bill[];
    products: Product[];
    menuModalities: MenuModality[];
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

function getOrderStatusBadge(status: string) {
    switch (status) {
        case 'pendiente':
            return (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300">
                    Pendiente
                </Badge>
            );
        case 'enviado_cocina':
            return (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300">
                    En Cocina
                </Badge>
            );
        case 'completado':
            return (
                <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300">
                    Completado
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

function getKitchenStatusLabel(status: string) {
    switch (status) {
        case 'pendiente':
            return { text: 'En cola', class: 'bg-amber-50 text-amber-700 border-amber-200', next: 'en_preparacion', nextText: 'Preparar' };
        case 'en_preparacion':
            return { text: 'En preparación', class: 'bg-blue-50 text-blue-700 border-blue-200', next: 'listo', nextText: 'Listo' };
        case 'listo':
            return { text: 'Listo para servir', class: 'bg-purple-50 text-purple-700 border-purple-200', next: 'entregado', nextText: 'Entregar' };
        case 'entregado':
            return { text: 'Entregado', class: 'bg-emerald-50 text-emerald-700 border-emerald-200', next: null, nextText: null };
        default:
            return { text: status, class: '', next: null, nextText: null };
    }
}

export default function Index({ orders, openBills, products, menuModalities }: Props) {
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [selectedOrderForAdd, setSelectedOrderForAdd] = useState<Order | null>(null);
    const [addItemModalOpen, setAddItemModalOpen] = useState(false);

    const filteredOrders = orders.filter((o) => {
        if (filterStatus === 'all') return true;
        return o.status === filterStatus;
    });

    const handleOpenAddItem = (order: Order) => {
        setSelectedOrderForAdd(order);
        setAddItemModalOpen(true);
    };

    return (
        <>
            <Head title="Comandas / Pedidos" />

            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <PageHeader
                        title="Comandas / Pedidos"
                        description="Registro de pedidos por mesa, control de cocina y despacho."
                    />

                    <Button onClick={() => setCreateModalOpen(true)}>
                        <Plus className="size-4 mr-1.5" />
                        Nueva Comanda
                    </Button>
                </div>

                {/* Filtros de estado */}
                <div className="flex gap-2 border-b pb-3 overflow-x-auto">
                    <Button
                        variant={filterStatus === 'all' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setFilterStatus('all')}
                    >
                        Todas ({orders.length})
                    </Button>
                    <Button
                        variant={filterStatus === 'pendiente' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setFilterStatus('pendiente')}
                    >
                        Pendientes ({orders.filter((o) => o.status === 'pendiente').length})
                    </Button>
                    <Button
                        variant={filterStatus === 'enviado_cocina' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setFilterStatus('enviado_cocina')}
                    >
                        En Cocina ({orders.filter((o) => o.status === 'enviado_cocina').length})
                    </Button>
                    <Button
                        variant={filterStatus === 'completado' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setFilterStatus('completado')}
                    >
                        Completadas ({orders.filter((o) => o.status === 'completado').length})
                    </Button>
                </div>

                {/* Grid de Comandas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredOrders.map((order) => {
                        const isDineIn = order.bill?.order_type === 'dine_in';
                        const items = order.items ?? [];
                        const orderTotal = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

                        return (
                            <div
                                key={order.id}
                                className="flex flex-col justify-between rounded-xl border bg-background shadow-sm overflow-hidden"
                            >
                                <div>
                                    {/* Card Header */}
                                    <div className="bg-muted/30 p-4 border-b flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                {isDineIn ? (
                                                    <UtensilsCrossed className="size-4" />
                                                ) : (
                                                    <ShoppingBag className="size-4" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">
                                                    Comanda #{order.id}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {isDineIn
                                                        ? `Mesa ${order.bill?.restaurant_table?.number ?? 'Sin mesa'}`
                                                        : 'Para Llevar'}
                                                    {' · '}
                                                    Cuenta #{order.bill_id}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-1">
                                            {getOrderStatusBadge(order.status)}
                                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                <Clock className="size-3" /> {formatDate(order.created_at)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Content - Items */}
                                    <div className="p-4 space-y-3">
                                        <p className="text-xs text-muted-foreground">
                                            Mesero: <span className="font-medium text-foreground">{order.user?.name ?? 'Sin usuario'}</span>
                                        </p>

                                        <div className="space-y-2">
                                            {items.length > 0 ? (
                                                items.map((item) => {
                                                    const kitchenInfo = getKitchenStatusLabel(item.kitchen_status);

                                                    return (
                                                        <div
                                                            key={item.id}
                                                            className="flex items-center justify-between rounded-lg border p-2.5 text-xs bg-muted/10"
                                                        >
                                                            <div className="space-y-0.5 max-w-[60%]">
                                                                <p className="font-semibold text-foreground">
                                                                    {item.quantity}x {item.product?.name ?? item.menu_modality?.name ?? 'Item'}
                                                                </p>
                                                                {item.notes && (
                                                                    <p className="text-[11px] text-amber-700 dark:text-amber-400 italic">
                                                                        "{item.notes}"
                                                                    </p>
                                                                )}
                                                                <p className="text-[11px] text-muted-foreground">
                                                                    {formatCurrency(Number(item.subtotal))}
                                                                </p>
                                                            </div>

                                                            <div className="flex items-center gap-1.5">
                                                                <Badge variant="outline" className={kitchenInfo.class}>
                                                                    {kitchenInfo.text}
                                                                </Badge>

                                                                {kitchenInfo.next && (
                                                                    <Form
                                                                        action={updateKitchenStatusRoute(item)}
                                                                        method="patch"
                                                                    >
                                                                        {({ processing }) => (
                                                                            <input
                                                                                type="hidden"
                                                                                name="kitchen_status"
                                                                                value={kitchenInfo.next!}
                                                                            />,
                                                                            <Button
                                                                                type="submit"
                                                                                size="sm"
                                                                                variant="outline"
                                                                                className="h-7 px-2 text-[11px]"
                                                                                disabled={processing}
                                                                            >
                                                                                {kitchenInfo.nextText}
                                                                            </Button>
                                                                        )}
                                                                    </Form>
                                                                )}

                                                                {item.kitchen_status === 'pendiente' && (
                                                                    <Form
                                                                        action={destroyItemRoute(item)}
                                                                        method="delete"
                                                                    >
                                                                        {({ processing }) => (
                                                                            <Button
                                                                                type="submit"
                                                                                size="icon"
                                                                                variant="ghost"
                                                                                className="size-7 text-destructive hover:bg-destructive/10"
                                                                                disabled={processing}
                                                                            >
                                                                                <Trash2 className="size-3.5" />
                                                                            </Button>
                                                                        )}
                                                                    </Form>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="py-4 text-center text-xs text-muted-foreground">
                                                    No hay productos en esta comanda.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer Actions */}
                                <div className="p-4 border-t bg-muted/20 space-y-2">
                                    <div className="flex items-center justify-between text-xs font-medium pb-1">
                                        <span>Total Comanda:</span>
                                        <span className="font-bold text-sm text-foreground">
                                            {formatCurrency(orderTotal)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {order.status !== 'completado' && (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="w-full text-xs"
                                                onClick={() => handleOpenAddItem(order)}
                                            >
                                                <Plus className="size-3.5 mr-1" />
                                                + Ítem
                                            </Button>
                                        )}

                                        {order.status === 'pendiente' && (
                                            <Form
                                                action={updateStatusRoute(order)}
                                                method="patch"
                                                className="w-full"
                                            >
                                                {({ processing }) => (
                                                    <>
                                                        <input
                                                            type="hidden"
                                                            name="status"
                                                            value="enviado_cocina"
                                                        />
                                                        <Button
                                                            type="submit"
                                                            size="sm"
                                                            className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white"
                                                            disabled={processing || items.length === 0}
                                                        >
                                                            <ChefHat className="size-3.5 mr-1" />
                                                            Enviar Cocina
                                                        </Button>
                                                    </>
                                                )}
                                            </Form>
                                        )}

                                        {order.status === 'enviado_cocina' && (
                                            <Form
                                                action={updateStatusRoute(order)}
                                                method="patch"
                                                className="w-full"
                                            >
                                                {({ processing }) => (
                                                    <>
                                                        <input
                                                            type="hidden"
                                                            name="status"
                                                            value="completado"
                                                        />
                                                        <Button
                                                            type="submit"
                                                            size="sm"
                                                            className="w-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                                            disabled={processing}
                                                        >
                                                            <CheckCircle className="size-3.5 mr-1" />
                                                            Completar
                                                        </Button>
                                                    </>
                                                )}
                                            </Form>
                                        )}

                                        {order.status === 'pendiente' && (
                                            <Form action={destroyOrderRoute(order)} method="delete">
                                                {({ processing }) => (
                                                    <Button
                                                        type="submit"
                                                        size="icon"
                                                        variant="outline"
                                                        className="size-8 text-destructive border-destructive/30"
                                                        disabled={processing}
                                                        title="Eliminar comanda"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                )}
                                            </Form>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredOrders.length === 0 && (
                        <div className="col-span-full py-12 text-center rounded-xl border bg-background text-muted-foreground space-y-2">
                            <AlertCircle className="size-8 mx-auto text-muted-foreground/60" />
                            <p className="font-medium text-sm">No hay comandas registradas en este estado.</p>
                        </div>
                    )}
                </div>
            </div>

            <CreateOrderModal
                openBills={openBills}
                products={products}
                menuModalities={menuModalities}
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
            />

            <AddItemModal
                order={selectedOrderForAdd}
                products={products}
                menuModalities={menuModalities}
                open={addItemModalOpen}
                onOpenChange={setAddItemModalOpen}
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
