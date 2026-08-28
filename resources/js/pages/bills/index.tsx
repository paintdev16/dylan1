import { Form, Head, Link } from '@inertiajs/react';
import {
    CircleCheck,
    Clock3,
    Eye,
    Plus,
    ReceiptText,
    ShoppingBag,
    UtensilsCrossed,
} from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { BillDetailModal } from '@/pages/bills/bill-detail-modal';
import { close, index, store } from '@/routes/bills';
import { Bill, BillOrderType, RestaurantTable } from '@/types/restaurant';

type Props = {
    bills: Bill[];
    restaurantTables: RestaurantTable[];
};

function formatDate(date: string): string {
    return new Intl.DateTimeFormat('es-PE', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'America/Lima',
    }).format(new Date(date));
}

function formatCurrency(amount: number): string {
    return `S/. ${amount.toFixed(2)}`;
}

export default function Index({ bills, restaurantTables }: Props) {
    const [open, setOpen] = useState(false);
    const [orderType, setOrderType] = useState<BillOrderType>('dine_in');
    const [tableId, setTableId] = useState('');

    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);

    const resetForm = () => {
        setOrderType('dine_in');
        setTableId('');
    };

    const handleViewDetail = (bill: Bill) => {
        setSelectedBill(bill);
        setDetailModalOpen(true);
    };

    return (
        <>
            <Head title="Cuentas" />

            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <PageHeader
                        title="Cuentas"
                        description="Abre, gestiona el consumo, cobra y controla las cuentas del restaurante."
                    />

                    <Dialog
                        open={open}
                        onOpenChange={(isOpen) => {
                            setOpen(isOpen);

                            if (!isOpen) {
                                resetForm();
                            }
                        }}
                    >
                        <DialogTrigger
                            render={
                                <Button>
                                    <Plus className="size-4" />
                                    Abrir cuenta
                                </Button>
                            }
                        />

                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Abrir cuenta</DialogTitle>
                                <DialogDescription>
                                    Selecciona si la cuenta corresponde a salón
                                    o a un pedido para llevar.
                                </DialogDescription>
                            </DialogHeader>

                            <Form
                                action={store()}
                                method="post"
                                className="space-y-5"
                                onSuccess={() => {
                                    setOpen(false);
                                    resetForm();
                                }}
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <input
                                            type="hidden"
                                            name="order_type"
                                            value={orderType}
                                        />

                                        <div className="space-y-2">
                                            <Label htmlFor="order_type">
                                                Tipo de atención
                                            </Label>
                                            <Select
                                                value={orderType}
                                                onValueChange={(value) => {
                                                    setOrderType(
                                                        value as BillOrderType,
                                                    );
                                                    setTableId('');
                                                }}
                                            >
                                                <SelectTrigger
                                                    id="order_type"
                                                    className="w-full"
                                                >
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="dine_in">
                                                        Salón
                                                    </SelectItem>
                                                    <SelectItem value="takeout">
                                                        Para llevar
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.order_type && (
                                                <p className="text-sm text-destructive">
                                                    {errors.order_type}
                                                </p>
                                            )}
                                        </div>

                                        {orderType === 'dine_in' ? (
                                            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                                                <p className="text-xs text-muted-foreground">
                                                    Las cuentas de <strong>Salón</strong> se inician automáticamente al abrir la mesa con la cantidad de comensales desde el plano del salón.
                                                </p>
                                                <Button asChild size="sm" variant="default" className="w-full">
                                                    <Link href="/tables">
                                                        Ir a Mesas para Abrir Mesa
                                                    </Link>
                                                </Button>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-muted-foreground">
                                                Se creará una cuenta para llevar sin mesa asignada para registrar pedidos directos en caja.
                                            </p>
                                        )}

                                        <div className="flex justify-end gap-3 pt-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setOpen(false)}
                                            >
                                                Cancelar
                                            </Button>
                                            {orderType === 'takeout' && (
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                >
                                                    {processing
                                                        ? 'Abriendo...'
                                                        : 'Abrir cuenta para llevar'}
                                                </Button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="h-12 px-5 font-semibold">
                                        Cuenta
                                    </TableHead>
                                    <TableHead className="h-12 font-semibold">
                                        Atención
                                    </TableHead>
                                    <TableHead className="h-12 font-semibold">
                                        Mesero
                                    </TableHead>
                                    <TableHead className="h-12 font-semibold text-right">
                                        Consumo Total
                                    </TableHead>
                                    <TableHead className="h-12 font-semibold text-right">
                                        Pagado
                                    </TableHead>
                                    <TableHead className="h-12 font-semibold text-right">
                                        Saldo
                                    </TableHead>
                                    <TableHead className="h-12 font-semibold">
                                        Estado
                                    </TableHead>
                                    <TableHead className="h-12 pr-5 text-right font-semibold">
                                        Acciones
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {bills.map((bill) => {
                                    const isOpen = bill.status === 'open';
                                    const isDineIn =
                                        bill.order_type === 'dine_in';
                                    const isFullyPaid = bill.balance === 0 && bill.total_amount > 0;

                                    return (
                                        <TableRow key={bill.id}>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                        <ReceiptText className="size-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">
                                                            Cuenta #{bill.id}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {isDineIn
                                                                ? `Mesa ${bill.restaurant_table?.number ?? 'sin asignar'}`
                                                                : 'Pedido para llevar'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    {isDineIn ? (
                                                        <UtensilsCrossed className="size-4 text-muted-foreground" />
                                                    ) : (
                                                        <ShoppingBag className="size-4 text-muted-foreground" />
                                                    )}
                                                    {isDineIn
                                                        ? 'Salón'
                                                        : 'Para llevar'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {bill.opening_waiter?.name ??
                                                    'Sin asignar'}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {formatCurrency(Number(bill.total_amount))}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-emerald-600 dark:text-emerald-400">
                                                {formatCurrency(Number(bill.paid_amount))}
                                            </TableCell>
                                            <TableCell className={`text-right font-bold ${bill.balance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>
                                                {formatCurrency(Number(bill.balance))}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={
                                                        isOpen
                                                            ? isFullyPaid
                                                                ? 'inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                                : 'inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                                            : 'inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                    }
                                                >
                                                    {isOpen
                                                        ? isFullyPaid
                                                            ? 'Pagada'
                                                            : 'Abierta'
                                                        : 'Cerrada'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="pr-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => handleViewDetail(bill)}
                                                    >
                                                        <Eye className="size-4" />
                                                        Detalle / Cobrar
                                                    </Button>

                                                    {isOpen && (
                                                        <Form
                                                            action={close(bill)}
                                                            method="patch"
                                                        >
                                                            {({ processing }) => (
                                                                <Button
                                                                    type="submit"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    disabled={
                                                                        processing || bill.balance > 0
                                                                    }
                                                                    title={
                                                                        bill.balance > 0
                                                                            ? 'Registre el pago completo antes de cerrar'
                                                                            : 'Cerrar cuenta y liberar mesa'
                                                                    }
                                                                >
                                                                    <CircleCheck className="size-4" />
                                                                    Cerrar
                                                                </Button>
                                                            )}
                                                        </Form>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}

                                {bills.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="h-36 text-center text-muted-foreground"
                                        >
                                            No hay cuentas registradas.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            <BillDetailModal
                bill={selectedBill}
                open={detailModalOpen}
                onOpenChange={(isOpen) => {
                    setDetailModalOpen(isOpen);
                    if (!isOpen) {
                        // Refresh selected bill when reopening or updating if needed
                        setSelectedBill(null);
                    }
                }}
            />
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Cuentas',
            href: index(),
        },
    ],
};

