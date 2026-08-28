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
import { Bill, DailyMenuProduct, MenuModality, Order, OrderItem, Product } from '@/types/restaurant';

type Props = {
    orders: Order[];
    openBills: Bill[];
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

export default function Index({ 
    orders, 
    openBills, 
    products, 
    menuModalities, 
    dailyMenuProducts = [] 
}: Props) {
    const [statusFilter, setStatusFilter] = useState<'todos' | 'pendiente' | 'enviado_cocina' | 'completado'>('todos');
    const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
    const [addItemModalOpen, setAddItemModalOpen] = useState<boolean>(false);
    const [selectedOrderForAdd, setSelectedOrderForAdd] = useState<Order | null>(null);

    const filteredOrders = orders.filter((o) => {
        if (statusFilter === 'todos') {
            return true;
        }
        return o.status === statusFilter;
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
                        description="Gestiona las comandas tomadas por mozos, sus platos y el flujo de preparación."
                    />

                    <Button onClick={() => setCreateModalOpen(true)} className="gap-2 self-start sm:self-auto">
                        <Plus className="size-4" />
                        Nueva Comanda
                    </Button>
                </div>

                {/* Filtros de estado */}
                <div className="flex flex-wrap gap-2">
                    {(['todos', 'pendiente', 'enviado_cocina', 'completado'] as const).map((st) => (
                        <Button
                            key={st}
                            variant={statusFilter === st ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setStatusFilter(st)}
                            className="capitalize text-xs"
                        >
                            {st === 'todos' ? 'Todos los Pedidos' : st.replace('_', ' ')}
                            <span className="ml-1.5 rounded-full bg-muted/30 px-1.5 py-0.5 text-[10px]">
                                {st === 'todos' ? orders.length : orders.filter((o) => o.status === st).length}
                            </span>
                        </Button>
                    ))}
                </div>

                {/* Grid de Comandas */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredOrders.map((order) => {
                        const items = order.items ?? [];
                        const totalAmount = items.reduce((sum, item) => sum + Number(item.subtotal), 0);
                        const tableNumber = order.bill?.restaurant_table?.number;

                        return (
                            <div
                                key={order.id}
                                className="flex flex-col justify-between rounded-xl border bg-card shadow-sm transition-all hover:shadow-md"
                            >
                                <div>
                                    {/* Header de Comanda */}
                                    <div className="flex items-center justify-between border-b p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                                                #{order.id}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5 font-semibold text-sm">
                                                    <span>{tableNumber ? `Mesa ${tableNumber}` : 'Para llevar'}</span>
                                                    <span className="text-muted-foreground font-normal text-xs">(Cta #{order.bill_id})</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                    <Clock className="size-3" />
                                                    <span>{formatDate(order.created_at)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {getOrderStatusBadge(order.status)}
                                    </div>

                                    {/* Lista de Ítems */}
                                    <div className="p-4 space-y-3">
                                        <p className="text-xs text-muted-foreground">
                                            Mesero: <span className="font-medium text-foreground">{order.user?.name ?? 'Sin usuario'}</span>
                                        </p>

                                        <div className="space-y-2">
                                            {items.length > 0 ? (
                                                items.map((item) => {
                                                    const kitchenInfo = getKitchenStatusLabel(item.kitchen_status);
                                                    const componentNames = item.daily_menu_products?.map(d => d.product?.name).filter(Boolean);

                                                    return (
                                                        <div
                                                            key={item.id}
                                                            className="flex items-center justify-between rounded-lg border p-2.5 text-xs bg-muted/10"
                                                        >
                                                            <div className="space-y-0.5 max-w-[60%]">
                                                                <p className="font-semibold text-foreground">
                                                                    {item.quantity}x {item.product?.name ?? item.menu_modality?.name ?? 'Item'}
                                                                </p>
                                                                {componentNames && componentNames.length > 0 && (
                                                                    <p className="text-[11px] text-primary/80 font-medium">
                                                                        ({componentNames.join(' + ')})
                                                                    </p>
                                                                )}
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
                                                                            <>
                                                                                <input
                                                                                    type="hidden"
                                                                                    name="kitchen_status"
                                                                                    value={kitchenInfo.next!}
                                                                                />
                                                                                <Button
                                                                                    type="submit"
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    className="h-7 px-2 text-[11px]"
                                                                                    disabled={processing}
                                                                                >
                                                                                    {kitchenInfo.nextText}
                                                                                </Button>
                                                                            </>
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
                                                                                className="size-7 text-muted-foreground hover:text-destructive"
                                                                                disabled={processing}
                                                                                title="Eliminar ítem"
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
                                                <div className="py-4 text-center text-xs text-muted-foreground border rounded-lg border-dashed">
                                                    Sin productos en esta comanda.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer de Comanda */}
                                <div className="border-t bg-muted/20 p-4 space-y-3">
                                    <div className="flex items-center justify-between text-xs font-semibold">
                                        <span className="text-muted-foreground">Subtotal Comanda:</span>
                                        <span className="text-sm font-bold text-primary">{formatCurrency(totalAmount)}</span>
                                    </div>

                                    {/* Acciones principales de la comanda */}
                                    <div className="flex items-center gap-2">
                                        {order.status === 'pendiente' && (
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
                dailyMenuProducts={dailyMenuProducts}
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
            />

            <AddItemModal
                order={selectedOrderForAdd}
                products={products}
                menuModalities={menuModalities}
                dailyMenuProducts={dailyMenuProducts}
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
