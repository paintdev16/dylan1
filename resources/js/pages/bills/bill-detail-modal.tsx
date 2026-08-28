import { Form } from '@inertiajs/react';
import {
    Banknote,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    QrCode,
    Receipt,
    ShoppingBag,
    Utensils,
    UtensilsCrossed,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { close as closeBillRoute } from '@/routes/bills';
import { store as storePaymentRoute } from '@/routes/bills/payments';
import { Bill, PaymentMethod } from '@/types/restaurant';

type Props = {
    bill: Bill | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

function formatCurrency(amount: number): string {
    return `S/. ${amount.toFixed(2)}`;
}

function formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('es-PE', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'America/Lima',
    }).format(new Date(dateString));
}

function getKitchenStatusBadge(status: string) {
    switch (status) {
        case 'pendiente':
            return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">En cola</Badge>;
        case 'en_preparacion':
            return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">En cocina</Badge>;
        case 'listo':
            return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Listo</Badge>;
        case 'entregado':
            return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Entregado</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

function getPaymentMethodLabel(method: PaymentMethod) {
    switch (method) {
        case 'efectivo':
            return (
                <span className="inline-flex items-center gap-1.5 font-medium">
                    <Banknote className="size-4 text-emerald-600" /> Efectivo
                </span>
            );
        case 'tarjeta':
            return (
                <span className="inline-flex items-center gap-1.5 font-medium">
                    <CreditCard className="size-4 text-blue-600" /> Tarjeta POS
                </span>
            );
        case 'yape':
            return (
                <span className="inline-flex items-center gap-1.5 font-medium">
                    <QrCode className="size-4 text-purple-600" /> Yape
                </span>
            );
        case 'plin':
            return (
                <span className="inline-flex items-center gap-1.5 font-medium">
                    <QrCode className="size-4 text-teal-600" /> Plin
                </span>
            );
        default:
            return method;
    }
}

export function BillDetailModal({ bill, open, onOpenChange }: Props) {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
    const [amount, setAmount] = useState<string>('');
    const [receiptNumber, setReceiptNumber] = useState<string>('');

    useEffect(() => {
        if (bill) {
            setAmount(bill.balance > 0 ? bill.balance.toString() : '');
            setPaymentMethod('efectivo');
            setReceiptNumber('');
        }
    }, [bill]);

    if (!bill) {
        return null;
    }

    const isOpen = bill.status === 'open';
    const isDineIn = bill.order_type === 'dine_in';
    const hasOrders = bill.orders && bill.orders.length > 0;
    const allItems = bill.orders?.flatMap((o) => o.items ?? []) ?? [];
    const hasPayments = bill.payments && bill.payments.length > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6">
                <DialogHeader className="space-y-1">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Receipt className="size-5 text-primary" />
                            Cuenta #{bill.id}
                        </DialogTitle>
                        <Badge
                            className={
                                isOpen
                                    ? bill.balance === 0 && bill.total_amount > 0
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 hover:bg-blue-100'
                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 hover:bg-amber-100'
                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 hover:bg-emerald-100'
                            }
                        >
                            {isOpen
                                ? bill.balance === 0 && bill.total_amount > 0
                                    ? 'Pagada (Lista para cerrar)'
                                    : 'Abierta'
                                : 'Cerrada'}
                        </Badge>
                    </div>
                    <DialogDescription className="text-sm text-muted-foreground flex items-center gap-4 pt-1">
                        <span className="flex items-center gap-1">
                            {isDineIn ? (
                                <UtensilsCrossed className="size-3.5" />
                            ) : (
                                <ShoppingBag className="size-3.5" />
                            )}
                            {isDineIn
                                ? `Mesa ${bill.restaurant_table?.number ?? 'Sin mesa'}`
                                : 'Pedido Para Llevar'}
                        </span>
                        <span>•</span>
                        <span>Mesero: {bill.opening_waiter?.name ?? 'Sin asignar'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Clock className="size-3.5" /> {formatDate(bill.opened_at)}
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <Separator className="my-2" />

                {/* Resumen Financiero KPI */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border bg-muted/30 p-3 text-center">
                        <p className="text-xs font-medium text-muted-foreground">Total Consumido</p>
                        <p className="text-lg font-bold text-foreground">
                            {formatCurrency(bill.total_amount)}
                        </p>
                    </div>
                    <div className="rounded-lg border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 p-3 text-center">
                        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Total Pagado</p>
                        <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
                            {formatCurrency(bill.paid_amount)}
                        </p>
                    </div>
                    <div
                        className={`rounded-lg border p-3 text-center ${
                            bill.balance > 0
                                ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 text-amber-800 dark:text-amber-300'
                                : 'bg-muted/30 text-foreground'
                        }`}
                    >
                        <p className="text-xs font-medium text-muted-foreground">Saldo Pendiente</p>
                        <p className="text-lg font-bold">
                            {formatCurrency(bill.balance)}
                        </p>
                    </div>
                </div>

                {/* Detalle de Consumo */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                        <Utensils className="size-4 text-muted-foreground" /> Detalle de Pedidos
                    </h3>
                    <div className="overflow-hidden rounded-lg border bg-background">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30">
                                    <TableHead className="h-9 font-medium text-xs">Producto / Item</TableHead>
                                    <TableHead className="h-9 font-medium text-xs text-center">Cant.</TableHead>
                                    <TableHead className="h-9 font-medium text-xs text-right">P. Unit</TableHead>
                                    <TableHead className="h-9 font-medium text-xs text-right">Subtotal</TableHead>
                                    <TableHead className="h-9 font-medium text-xs text-center">Cocina</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allItems.length > 0 ? (
                                    allItems.map((item) => (
                                        <TableRow key={item.id} className="text-sm">
                                            <TableCell className="font-medium py-2.5">
                                                {item.product?.name ?? item.menu_modality?.name ?? 'Item sin nombre'}
                                                {item.notes && (
                                                    <p className="text-xs text-muted-foreground italic">
                                                        Nota: {item.notes}
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center py-2.5">{item.quantity}</TableCell>
                                            <TableCell className="text-right py-2.5">
                                                {formatCurrency(Number(item.unit_price))}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold py-2.5">
                                                {formatCurrency(Number(item.subtotal))}
                                            </TableCell>
                                            <TableCell className="text-center py-2.5">
                                                {getKitchenStatusBadge(item.kitchen_status)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-20 text-center text-sm text-muted-foreground">
                                            No se han registrado comandas o productos en esta cuenta aún.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Historial de Pagos si los hay */}
                {hasPayments && (
                    <div className="space-y-3 pt-2">
                        <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                            <DollarSign className="size-4 text-emerald-600" /> Historial de Pagos Registrados
                        </h3>
                        <div className="overflow-hidden rounded-lg border bg-background">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                                        <TableHead className="h-9 font-medium text-xs">Fecha</TableHead>
                                        <TableHead className="h-9 font-medium text-xs">Método de Pago</TableHead>
                                        <TableHead className="h-9 font-medium text-xs">N° Comprobante</TableHead>
                                        <TableHead className="h-9 font-medium text-xs">Cajero</TableHead>
                                        <TableHead className="h-9 font-medium text-xs text-right">Monto</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bill.payments?.map((payment) => (
                                        <TableRow key={payment.id} className="text-sm">
                                            <TableCell className="py-2">{formatDate(payment.created_at)}</TableCell>
                                            <TableCell className="py-2">
                                                {getPaymentMethodLabel(payment.payment_method)}
                                            </TableCell>
                                            <TableCell className="py-2 text-muted-foreground font-mono text-xs">
                                                {payment.receipt_number ?? '-'}
                                            </TableCell>
                                            <TableCell className="py-2">{payment.cashier?.name ?? 'Cajero'}</TableCell>
                                            <TableCell className="py-2 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                                                {formatCurrency(Number(payment.amount))}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {/* Formulario de Cobro (si la cuenta está abierta y hay saldo pendiente > 0) */}
                {isOpen && bill.balance > 0 && (
                    <div className="rounded-xl border bg-muted/20 p-4 space-y-4">
                        <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                            <Banknote className="size-4 text-primary" /> Registrar Pago
                        </h3>

                        <Form
                            action={storePaymentRoute(bill)}
                            method="post"
                            className="space-y-4"
                        >
                            {({ errors, processing }) => (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="payment_method" className="text-xs">
                                                Método de Pago
                                            </Label>
                                            <input
                                                type="hidden"
                                                name="payment_method"
                                                value={paymentMethod}
                                            />
                                            <Select
                                                value={paymentMethod}
                                                onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
                                            >
                                                <SelectTrigger id="payment_method" className="h-9 bg-background">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="efectivo">Efectivo</SelectItem>
                                                    <SelectItem value="tarjeta">Tarjeta POS</SelectItem>
                                                    <SelectItem value="yape">Yape</SelectItem>
                                                    <SelectItem value="plin">Plin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.payment_method && (
                                                <p className="text-xs text-destructive">{errors.payment_method}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="amount" className="text-xs">
                                                Monto a Cobrar (S/.)
                                            </Label>
                                            <Input
                                                id="amount"
                                                name="amount"
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                max={bill.balance}
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="h-9 bg-background font-semibold"
                                            />
                                            {errors.amount && (
                                                <p className="text-xs text-destructive">{errors.amount}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="receipt_number" className="text-xs">
                                                N° Recibo / Operación (opcional)
                                            </Label>
                                            <Input
                                                id="receipt_number"
                                                name="receipt_number"
                                                type="text"
                                                value={receiptNumber}
                                                onChange={(e) => setReceiptNumber(e.target.value)}
                                                placeholder="Ej. OP-129482"
                                                className="h-9 bg-background"
                                            />
                                            {errors.receipt_number && (
                                                <p className="text-xs text-destructive">{errors.receipt_number}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-1">
                                        <Button
                                            type="submit"
                                            disabled={processing || !amount || Number(amount) <= 0}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                        >
                                            <CheckCircle2 className="size-4 mr-1.5" />
                                            {processing ? 'Procesando Pago...' : `Cobrar ${formatCurrency(Number(amount) || 0)}`}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                )}

                {/* Opción de Cierre Manual si la cuenta ya está saldada (balance == 0) pero sigue abierta */}
                {isOpen && bill.balance === 0 && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                                La cuenta está completamente saldada.
                            </p>
                            <p className="text-xs text-emerald-700 dark:text-emerald-400">
                                Puedes procedes a cerrar la cuenta para liberar la mesa.
                            </p>
                        </div>

                        <Form action={closeBillRoute(bill)} method="patch">
                            {({ processing }) => (
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    variant="outline"
                                    className="border-emerald-300 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                                >
                                    <CheckCircle2 className="size-4 mr-1.5" />
                                    {processing ? 'Cerrando...' : 'Cerrar y Liberar Mesa'}
                                </Button>
                            )}
                        </Form>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
