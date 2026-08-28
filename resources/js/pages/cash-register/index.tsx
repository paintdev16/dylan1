import { Form, Head } from '@inertiajs/react';
import {
    AlertCircle,
    Banknote,
    CheckCircle2,
    CircleDollarSign,
    Clock,
    CreditCard,
    DollarSign,
    Lock,
    QrCode,
    Receipt,
    ReceiptText,
    TrendingUp,
    Utensils,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/page-header';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Bill,
    CashRegisterSession,
    CashRegisterSummary,
    PaymentMethod,
} from '@/types/restaurant';

type Props = {
    activeSession: CashRegisterSession | null;
    summary: CashRegisterSummary | null;
    pendingBills: Bill[];
    pastSessions: CashRegisterSession[];
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

export default function CashRegisterIndex({
    activeSession,
    summary,
    pendingBills,
    pastSessions,
}: Props) {
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [closeSessionModalOpen, setCloseSessionModalOpen] = useState(false);

    // Payment Form state
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
    const [paymentAmount, setPaymentAmount] = useState<string>('');
    const [receivedAmount, setReceivedAmount] = useState<string>('');
    const [receiptNumber, setReceiptNumber] = useState<string>('');

    // Close session state
    const [closingAmount, setClosingAmount] = useState<string>('');
    const [closingNotes, setClosingNotes] = useState<string>('');

    const handleOpenPayment = (bill: Bill) => {
        setSelectedBill(bill);
        setPaymentAmount(bill.balance.toString());
        setReceivedAmount(bill.balance.toString());
        setPaymentMethod('efectivo');
        setReceiptNumber('');
        setPaymentModalOpen(true);
    };

    const calculatedChange = () => {
        const pay = parseFloat(paymentAmount) || 0;
        const rec = parseFloat(receivedAmount) || 0;
        return Math.max(0, rec - pay);
    };

    const expectedCashInDrawer = summary?.expected_cash ?? 0;
    const closingDiff = (parseFloat(closingAmount) || 0) - expectedCashInDrawer;

    return (
        <>
            <Head title="Caja" />

            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <PageHeader
                        title="Módulo de Caja"
                        description="Gestión de cobros, arqueo de turno y facturación del restaurante."
                    />

                    {activeSession && (
                        <div className="flex items-center gap-3">
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 py-1 px-3 text-xs gap-1.5 font-medium">
                                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                Turno de Caja Abierto ({formatTime(activeSession.opened_at)})
                            </Badge>

                            <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:bg-destructive/10 border-destructive/30 gap-1.5"
                                onClick={() => {
                                    setClosingAmount(expectedCashInDrawer.toString());
                                    setCloseSessionModalOpen(true);
                                }}
                            >
                                <Lock className="size-3.5" />
                                Cerrar Turno de Caja
                            </Button>
                        </div>
                    )}
                </div>

                {/* Si no hay sesión activa: Apertura de Caja */}
                {!activeSession ? (
                    <div className="mx-auto max-w-lg rounded-2xl border bg-card p-8 shadow-sm space-y-6 text-center my-8">
                        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <CircleDollarSign className="size-8" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-foreground">Apertura de Turno de Caja</h3>
                            <p className="text-sm text-muted-foreground">
                                Para poder registrar cobros y pagos de comandas, debes iniciar tu turno indicando el fondo inicial en efectivo.
                            </p>
                        </div>

                        <Form
                            action="/cash-register/open"
                            method="post"
                            className="space-y-4 text-left pt-2"
                        >
                            {({ errors, processing }) => (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="opening_amount">Fondo Inicial en Efectivo (S/)</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-sm font-semibold text-muted-foreground">S/.</span>
                                            <Input
                                                id="opening_amount"
                                                name="opening_amount"
                                                type="number"
                                                step="0.10"
                                                min="0"
                                                defaultValue="100.00"
                                                className="pl-9 text-base font-semibold"
                                                required
                                                autoFocus
                                            />
                                        </div>
                                        {errors.opening_amount && (
                                            <p className="text-xs text-destructive">{errors.opening_amount}</p>
                                        )}
                                        {errors.session && (
                                            <p className="text-xs text-destructive">{errors.session}</p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-5"
                                        disabled={processing}
                                    >
                                        {processing ? 'Abriendo caja...' : 'Aperturar Turno de Caja'}
                                    </Button>
                                </>
                            )}
                        </Form>
                    </div>
                ) : (
                    <>
                        {/* Resumen Financiero del Turno */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl border bg-card p-4 shadow-sm space-y-2">
                                <div className="flex items-center justify-between text-muted-foreground text-xs">
                                    <span>Fondo Inicial</span>
                                    <Wallet className="size-4 text-primary" />
                                </div>
                                <p className="text-2xl font-bold text-foreground">
                                    {formatCurrency(Number(activeSession.opening_amount))}
                                </p>
                            </div>

                            <div className="rounded-xl border bg-card p-4 shadow-sm space-y-2">
                                <div className="flex items-center justify-between text-muted-foreground text-xs">
                                    <span>Efectivo en Gaveta</span>
                                    <Banknote className="size-4 text-emerald-600" />
                                </div>
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(summary?.expected_cash ?? 0)}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    Fondo + S/. {Number(summary?.cash_total ?? 0).toFixed(2)} ventas
                                </p>
                            </div>

                            <div className="rounded-xl border bg-card p-4 shadow-sm space-y-2">
                                <div className="flex items-center justify-between text-muted-foreground text-xs">
                                    <span>Tarjetas & Digital</span>
                                    <CreditCard className="size-4 text-blue-600" />
                                </div>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {formatCurrency((summary?.card_total ?? 0) + (summary?.digital_total ?? 0))}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    POS: {formatCurrency(summary?.card_total ?? 0)} · Yape/Plin: {formatCurrency(summary?.digital_total ?? 0)}
                                </p>
                            </div>

                            <div className="rounded-xl border bg-card p-4 shadow-sm space-y-2">
                                <div className="flex items-center justify-between text-muted-foreground text-xs">
                                    <span>Total Ventas Turno</span>
                                    <TrendingUp className="size-4 text-purple-600" />
                                </div>
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {formatCurrency(summary?.total_collected ?? 0)}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    {summary?.transactions_count ?? 0} transacciones cobradas
                                </p>
                            </div>
                        </div>

                        {/* Cuentas Pendientes de Cobro */}
                        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                            <div className="p-4 border-b flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-base">Cuentas Pendientes de Cobro</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Selecciona una cuenta para registrar el pago y liberar la mesa automáticamente.
                                    </p>
                                </div>

                                <Badge variant="outline" className="text-xs font-semibold">
                                    {pendingBills.length} {pendingBills.length === 1 ? 'cuenta pendiente' : 'cuentas pendientes'}
                                </Badge>
                            </div>

                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/30">
                                            <TableHead className="w-[100px] text-xs">Cuenta</TableHead>
                                            <TableHead className="text-xs">Mesa / Tipo</TableHead>
                                            <TableHead className="text-xs">Mozo Apertura</TableHead>
                                            <TableHead className="text-xs">Hora</TableHead>
                                            <TableHead className="text-xs text-right">Total Consumo</TableHead>
                                            <TableHead className="text-xs text-right">Pagado</TableHead>
                                            <TableHead className="text-xs text-right">Saldo Pendiente</TableHead>
                                            <TableHead className="text-xs text-center">Acción</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pendingBills.map((bill) => {
                                            const tableNumber = bill.restaurant_table?.number;

                                            return (
                                                <TableRow key={bill.id} className="hover:bg-muted/10">
                                                    <TableCell className="font-bold text-primary">
                                                        #{bill.id}
                                                    </TableCell>
                                                    <TableCell className="font-semibold">
                                                        {bill.order_type === 'dine_in' ? (
                                                            <span className="inline-flex items-center gap-1.5">
                                                                <Utensils className="size-3.5 text-muted-foreground" />
                                                                Mesa {tableNumber ?? 'Sin mesa'}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground">Para llevar</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {bill.opening_waiter?.name ?? 'Sin mozo'}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {formatTime(bill.opened_at)}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {formatCurrency(Number(bill.total_amount))}
                                                    </TableCell>
                                                    <TableCell className="text-right text-muted-foreground">
                                                        {formatCurrency(Number(bill.paid_amount))}
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                        {formatCurrency(Number(bill.balance))}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Button
                                                            size="sm"
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5 h-8"
                                                            onClick={() => handleOpenPayment(bill)}
                                                        >
                                                            <Banknote className="size-3.5" />
                                                            Cobrar
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}

                                        {pendingBills.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                                                    <CheckCircle2 className="size-8 mx-auto text-emerald-500 mb-2" />
                                                    <p className="font-medium text-sm">No hay cuentas pendientes por cobrar.</p>
                                                    <p className="text-xs">Todas las atenciones se encuentran al día y pagadas.</p>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Modal de Cobro */}
            {selectedBill && (
                <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
                    <DialogContent className="max-w-lg p-6">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-lg">
                                <DollarSign className="size-5 text-emerald-600" />
                                Cobrar Cuenta #{selectedBill.id}
                            </DialogTitle>
                            <DialogDescription>
                                {selectedBill.order_type === 'dine_in'
                                    ? `Mesa #${selectedBill.restaurant_table?.number ?? 'Sin mesa'}`
                                    : 'Pedido Para Llevar'}
                                {' · Saldo a Liquidar: '}
                                <strong className="text-emerald-600 font-bold">{formatCurrency(selectedBill.balance)}</strong>
                            </DialogDescription>
                        </DialogHeader>

                        <Form
                            action={`/cash-register/bills/${selectedBill.id}/pay`}
                            method="post"
                            className="space-y-4 pt-2"
                            onSuccess={() => setPaymentModalOpen(false)}
                        >
                            {({ errors, processing }) => (
                                <>
                                    {/* Método de pago */}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Método de Pago</Label>
                                        <input type="hidden" name="payment_method" value={paymentMethod} />
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                            {[
                                                { id: 'efectivo', label: 'Efectivo', icon: Banknote },
                                                { id: 'tarjeta', label: 'Tarjeta POS', icon: CreditCard },
                                                { id: 'yape', label: 'Yape', icon: QrCode },
                                                { id: 'plin', label: 'Plin', icon: QrCode },
                                            ].map((m) => {
                                                const Icon = m.icon;
                                                const isSelected = paymentMethod === m.id;

                                                return (
                                                    <Button
                                                        key={m.id}
                                                        type="button"
                                                        variant={isSelected ? 'default' : 'outline'}
                                                        size="sm"
                                                        className="flex flex-col gap-1 py-3 h-auto"
                                                        onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                                                    >
                                                        <Icon className="size-4" />
                                                        <span className="text-xs">{m.label}</span>
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                        {errors.payment_method && (
                                            <p className="text-xs text-destructive">{errors.payment_method}</p>
                                        )}
                                    </div>

                                    {/* Importes */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="amount" className="text-xs">Importe a Cobrar (S/)</Label>
                                            <Input
                                                id="amount"
                                                name="amount"
                                                type="number"
                                                step="0.10"
                                                min="0.01"
                                                max={selectedBill.balance}
                                                value={paymentAmount}
                                                onChange={(e) => setPaymentAmount(e.target.value)}
                                                className="font-bold text-base"
                                                required
                                            />
                                            {errors.amount && (
                                                <p className="text-xs text-destructive">{errors.amount}</p>
                                            )}
                                        </div>

                                        {paymentMethod === 'efectivo' && (
                                            <div className="space-y-1.5">
                                                <Label htmlFor="received_amount" className="text-xs">Efectivo Recibido (S/)</Label>
                                                <Input
                                                    id="received_amount"
                                                    name="received_amount"
                                                    type="number"
                                                    step="0.10"
                                                    min="0.01"
                                                    value={receivedAmount}
                                                    onChange={(e) => setReceivedAmount(e.target.value)}
                                                    className="font-bold text-base bg-emerald-50/20"
                                                    autoFocus
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Cálculo de Vuelto */}
                                    {paymentMethod === 'efectivo' && (
                                        <div className="rounded-lg border bg-emerald-50/30 dark:bg-emerald-950/20 p-3 flex items-center justify-between">
                                            <span className="text-xs font-medium text-muted-foreground">Vuelto a entregar al cliente:</span>
                                            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                                {formatCurrency(calculatedChange())}
                                            </span>
                                        </div>
                                    )}

                                    {/* Nro de Comprobante opcional */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="receipt_number" className="text-xs">N° Comprobante / Ticket (Opcional)</Label>
                                        <Input
                                            id="receipt_number"
                                            name="receipt_number"
                                            placeholder={`B001-${String(selectedBill.id).padStart(6, '0')}`}
                                            value={receiptNumber}
                                            onChange={(e) => setReceiptNumber(e.target.value)}
                                        />
                                    </div>

                                    {/* Botones */}
                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setPaymentModalOpen(false)}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                                            disabled={processing || !paymentAmount}
                                        >
                                            {processing ? 'Registrando...' : 'Confirmar Cobro y Liberar Mesa'}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            )}

            {/* Modal de Cierre de Caja */}
            {activeSession && (
                <Dialog open={closeSessionModalOpen} onOpenChange={setCloseSessionModalOpen}>
                    <DialogContent className="max-w-md p-6">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-lg">
                                <Lock className="size-5 text-destructive" />
                                Cierre y Arqueo de Turno de Caja
                            </DialogTitle>
                            <DialogDescription>
                                Realiza el conteo físico del dinero en efectivo de la gaveta para el cuadre final.
                            </DialogDescription>
                        </DialogHeader>

                        <Form
                            action={`/cash-register/sessions/${activeSession.id}/close`}
                            method="post"
                            className="space-y-4 pt-2"
                            onSuccess={() => setCloseSessionModalOpen(false)}
                        >
                            {({ errors, processing }) => (
                                <>
                                    <div className="rounded-lg border bg-muted/20 p-3 space-y-1 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Fondo Inicial:</span>
                                            <span>{formatCurrency(Number(activeSession.opening_amount))}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Ventas en Efectivo:</span>
                                            <span>{formatCurrency(summary?.cash_total ?? 0)}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-1 font-bold">
                                            <span>Efectivo Esperado en Gaveta:</span>
                                            <span className="text-primary">{formatCurrency(expectedCashInDrawer)}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="closing_amount">Efectivo Real Contado en Gaveta (S/)</Label>
                                        <Input
                                            id="closing_amount"
                                            name="closing_amount"
                                            type="number"
                                            step="0.10"
                                            min="0"
                                            value={closingAmount}
                                            onChange={(e) => setClosingAmount(e.target.value)}
                                            className="text-base font-bold"
                                            required
                                            autoFocus
                                        />
                                        {errors.closing_amount && (
                                            <p className="text-xs text-destructive">{errors.closing_amount}</p>
                                        )}
                                    </div>

                                    {/* Indicador de Diferencia / Descuadre */}
                                    <div
                                        className={`rounded-lg border p-3 flex items-center justify-between text-xs font-semibold ${
                                            Math.abs(closingDiff) < 0.01
                                                ? 'bg-emerald-100/50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-300'
                                                : closingDiff > 0
                                                ? 'bg-blue-100/50 text-blue-800 border-blue-300 dark:bg-blue-950/30 dark:text-blue-300'
                                                : 'bg-red-100/50 text-red-800 border-red-300 dark:bg-red-950/30 dark:text-red-300'
                                        }`}
                                    >
                                        <span>
                                            {Math.abs(closingDiff) < 0.01
                                                ? 'Cuadre exacto (Sin diferencia)'
                                                : closingDiff > 0
                                                ? 'Sobrante en caja:'
                                                : 'Faltante en caja:'}
                                        </span>
                                        <span className="text-sm font-bold">
                                            {closingDiff >= 0 ? `+ ${formatCurrency(closingDiff)}` : `- ${formatCurrency(Math.abs(closingDiff))}`}
                                        </span>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="notes" className="text-xs">Observaciones de Cierre (Opcional)</Label>
                                        <Input
                                            id="notes"
                                            name="notes"
                                            placeholder="Ej. Billetes deteriorados, cambio guardado"
                                            value={closingNotes}
                                            onChange={(e) => setClosingNotes(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setCloseSessionModalOpen(false)}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="destructive"
                                            disabled={processing || !closingAmount}
                                        >
                                            {processing ? 'Cerrando caja...' : 'Confirmar Cierre de Caja'}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}

CashRegisterIndex.layout = {
    breadcrumbs: [
        {
            title: 'Caja',
            href: '/cash-register',
        },
    ],
};
