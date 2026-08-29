import { Form, Head, usePoll } from '@inertiajs/react';
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
import {
    close as closeCashRegister,
    open as openCashRegister,
    pay as payBill,
} from '@/routes/cash-register';
import { store as storeMovement } from '@/routes/cash-register/movements';
import { review as reviewCancellation } from '@/routes/cancellation-requests';
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
    cancellationRequests: Array<{
        id: number;
        reason: string;
        previous_status: string;
        requester: { name: string };
        order_item: {
            product?: { name: string };
            menu_modality?: { name: string };
            order: { bill: { restaurant_table?: { number: number } } };
        };
    }>;
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
    cancellationRequests,
}: Props) {
    usePoll(5000, {
        only: [
            'activeSession',
            'summary',
            'pendingBills',
            'cancellationRequests',
            'flash',
        ],
    });
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [closeSessionModalOpen, setCloseSessionModalOpen] = useState(false);
    const [movementModalOpen, setMovementModalOpen] = useState(false);

    // Payment Form state
    const [paymentMethod, setPaymentMethod] =
        useState<PaymentMethod>('efectivo');
    const [paymentAmount, setPaymentAmount] = useState<string>('');
    const [receivedAmount, setReceivedAmount] = useState<string>('');
    const [receiptNumber, setReceiptNumber] = useState<string>('');
    const [splitPayment, setSplitPayment] = useState(false);
    const [firstPaymentAmount, setFirstPaymentAmount] = useState<string>('');
    const [secondPaymentMethod, setSecondPaymentMethod] =
        useState<PaymentMethod>('yape');
    const [receiptType, setReceiptType] = useState<
        'ticket' | 'boleta' | 'factura'
    >('ticket');
    const [customerName, setCustomerName] = useState<string>('');
    const [customerDocument, setCustomerDocument] = useState<string>('');

    // Close session state
    const [closingAmount, setClosingAmount] = useState<string>('');
    const [closingNotes, setClosingNotes] = useState<string>('');

    const handleOpenPayment = (bill: Bill) => {
        setSelectedBill(bill);
        setPaymentAmount(bill.balance.toString());
        setReceivedAmount(bill.balance.toString());
        setPaymentMethod('efectivo');
        setReceiptNumber('');
        setSplitPayment(false);
        setFirstPaymentAmount((bill.balance / 2).toFixed(2));
        setSecondPaymentMethod('yape');
        setReceiptType('ticket');
        setCustomerName('');
        setCustomerDocument('');
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
                            <Badge className="gap-1.5 bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                                <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
                                Turno de Caja Abierto (
                                {formatTime(activeSession.opened_at)})
                            </Badge>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setMovementModalOpen(true)}
                            >
                                <Wallet className="size-3.5" />
                                Movimiento
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                    setClosingAmount(
                                        expectedCashInDrawer.toString(),
                                    );
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
                    <div className="mx-auto my-8 max-w-lg space-y-6 rounded-2xl border bg-card p-8 text-center shadow-sm">
                        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <CircleDollarSign className="size-8" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-foreground">
                                Apertura de Turno de Caja
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Para poder registrar cobros y pagos de comandas,
                                debes iniciar tu turno indicando el fondo
                                inicial en efectivo.
                            </p>
                        </div>

                        <Form
                            {...openCashRegister.form()}
                            className="space-y-4 pt-2 text-left"
                        >
                            {({ errors, processing }) => (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="opening_amount">
                                            Fondo Inicial en Efectivo (S/)
                                        </Label>
                                        <div className="relative">
                                            <span className="absolute top-2.5 left-3 text-sm font-semibold text-muted-foreground">
                                                S/.
                                            </span>
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
                                            <p className="text-xs text-destructive">
                                                {errors.opening_amount}
                                            </p>
                                        )}
                                        {errors.session && (
                                            <p className="text-xs text-destructive">
                                                {errors.session}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-emerald-600 py-5 font-semibold text-white hover:bg-emerald-700"
                                        disabled={processing}
                                    >
                                        {processing
                                            ? 'Abriendo caja...'
                                            : 'Aperturar Turno de Caja'}
                                    </Button>
                                </>
                            )}
                        </Form>
                    </div>
                ) : (
                    <>
                        {/* Resumen Financiero del Turno */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-2 rounded-xl border bg-card p-4 shadow-sm">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Fondo Inicial</span>
                                    <Wallet className="size-4 text-primary" />
                                </div>
                                <p className="text-2xl font-bold text-foreground">
                                    {formatCurrency(
                                        Number(activeSession.opening_amount),
                                    )}
                                </p>
                            </div>

                            <div className="space-y-2 rounded-xl border bg-card p-4 shadow-sm">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Efectivo en Gaveta</span>
                                    <Banknote className="size-4 text-emerald-600" />
                                </div>
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(
                                        summary?.expected_cash ?? 0,
                                    )}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    Fondo + S/.{' '}
                                    {Number(summary?.cash_total ?? 0).toFixed(
                                        2,
                                    )}{' '}
                                    ventas
                                </p>
                            </div>

                            <div className="space-y-2 rounded-xl border bg-card p-4 shadow-sm">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Tarjetas & Digital</span>
                                    <CreditCard className="size-4 text-blue-600" />
                                </div>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {formatCurrency(
                                        (summary?.card_total ?? 0) +
                                            (summary?.digital_total ?? 0),
                                    )}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    POS:{' '}
                                    {formatCurrency(summary?.card_total ?? 0)} ·
                                    Yape/Plin:{' '}
                                    {formatCurrency(
                                        summary?.digital_total ?? 0,
                                    )}
                                </p>
                            </div>

                            <div className="space-y-2 rounded-xl border bg-card p-4 shadow-sm">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Total Ventas Turno</span>
                                    <TrendingUp className="size-4 text-purple-600" />
                                </div>
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {formatCurrency(
                                        summary?.total_collected ?? 0,
                                    )}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    {summary?.transactions_count ?? 0}{' '}
                                    transacciones cobradas
                                </p>
                            </div>
                        </div>

                        {/* Cuentas Pendientes de Cobro */}
                        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                            <div className="flex items-center justify-between border-b p-4">
                                <div>
                                    <h3 className="text-base font-semibold">
                                        Cuentas Pendientes de Cobro
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Selecciona una cuenta para registrar el
                                        pago y liberar la mesa automáticamente.
                                    </p>
                                </div>

                                <Badge
                                    variant="outline"
                                    className="text-xs font-semibold"
                                >
                                    {pendingBills.length}{' '}
                                    {pendingBills.length === 1
                                        ? 'cuenta pendiente'
                                        : 'cuentas pendientes'}
                                </Badge>
                            </div>

                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/30">
                                            <TableHead className="w-[100px] text-xs">
                                                Cuenta
                                            </TableHead>
                                            <TableHead className="text-xs">
                                                Mesa / Tipo
                                            </TableHead>
                                            <TableHead className="text-xs">
                                                Mozo Apertura
                                            </TableHead>
                                            <TableHead className="text-xs">
                                                Hora
                                            </TableHead>
                                            <TableHead className="text-right text-xs">
                                                Total Consumo
                                            </TableHead>
                                            <TableHead className="text-right text-xs">
                                                Pagado
                                            </TableHead>
                                            <TableHead className="text-right text-xs">
                                                Saldo Pendiente
                                            </TableHead>
                                            <TableHead className="text-center text-xs">
                                                Acción
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pendingBills.map((bill) => {
                                            const tableNumber =
                                                bill.restaurant_table?.number;

                                            return (
                                                <TableRow
                                                    key={bill.id}
                                                    className="hover:bg-muted/10"
                                                >
                                                    <TableCell className="font-bold text-primary">
                                                        #{bill.id}
                                                    </TableCell>
                                                    <TableCell className="font-semibold">
                                                        {bill.order_type ===
                                                        'dine_in' ? (
                                                            <span className="inline-flex items-center gap-1.5">
                                                                <Utensils className="size-3.5 text-muted-foreground" />
                                                                Mesa{' '}
                                                                {tableNumber ??
                                                                    'Sin mesa'}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground">
                                                                Para llevar
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {bill.opening_waiter
                                                            ?.name ??
                                                            'Sin mozo'}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {formatTime(
                                                            bill.opened_at,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {formatCurrency(
                                                            Number(
                                                                bill.total_amount,
                                                            ),
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right text-muted-foreground">
                                                        {formatCurrency(
                                                            Number(
                                                                bill.paid_amount,
                                                            ),
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                        {formatCurrency(
                                                            Number(
                                                                bill.balance,
                                                            ),
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Button
                                                            size="sm"
                                                            className="h-8 gap-1.5 bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700"
                                                            onClick={() =>
                                                                handleOpenPayment(
                                                                    bill,
                                                                )
                                                            }
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
                                                <TableCell
                                                    colSpan={8}
                                                    className="py-12 text-center text-muted-foreground"
                                                >
                                                    <CheckCircle2 className="mx-auto mb-2 size-8 text-emerald-500" />
                                                    <p className="text-sm font-medium">
                                                        No hay cuentas
                                                        pendientes por cobrar.
                                                    </p>
                                                    <p className="text-xs">
                                                        Todas las atenciones se
                                                        encuentran al día y
                                                        pagadas.
                                                    </p>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {cancellationRequests.length > 0 && (
                            <div className="rounded-xl border bg-card p-4 shadow-sm">
                                <h3 className="font-semibold">
                                    Cancelaciones por autorizar
                                </h3>
                                <p className="mb-4 text-xs text-muted-foreground">
                                    Consumos que ya ingresaron a preparación o
                                    fueron entregados.
                                </p>
                                <div className="space-y-3">
                                    {cancellationRequests.map(
                                        (cancellation) => (
                                            <div
                                                key={cancellation.id}
                                                className="flex flex-col justify-between gap-3 rounded-lg border p-3 sm:flex-row sm:items-center"
                                            >
                                                <div className="text-sm">
                                                    <p className="font-medium">
                                                        {cancellation.order_item
                                                            .product?.name ??
                                                            cancellation
                                                                .order_item
                                                                .menu_modality
                                                                ?.name ??
                                                            'Consumo'}{' '}
                                                        · Mesa{' '}
                                                        {cancellation.order_item
                                                            .order.bill
                                                            .restaurant_table
                                                            ?.number ?? '-'}
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        Solicita{' '}
                                                        {
                                                            cancellation
                                                                .requester.name
                                                        }
                                                        : {cancellation.reason}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Form
                                                        {...reviewCancellation.form(
                                                            cancellation.id,
                                                        )}
                                                    >
                                                        <input
                                                            type="hidden"
                                                            name="decision"
                                                            value="rejected"
                                                        />
                                                        <Button
                                                            type="submit"
                                                            size="sm"
                                                            variant="outline"
                                                        >
                                                            Rechazar
                                                        </Button>
                                                    </Form>
                                                    <Form
                                                        {...reviewCancellation.form(
                                                            cancellation.id,
                                                        )}
                                                    >
                                                        <input
                                                            type="hidden"
                                                            name="decision"
                                                            value="approved"
                                                        />
                                                        <Button
                                                            type="submit"
                                                            size="sm"
                                                            variant="destructive"
                                                        >
                                                            Aprobar
                                                        </Button>
                                                    </Form>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal de Cobro */}
            {selectedBill && (
                <Dialog
                    open={paymentModalOpen}
                    onOpenChange={setPaymentModalOpen}
                >
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
                                <strong className="font-bold text-emerald-600">
                                    {formatCurrency(selectedBill.balance)}
                                </strong>
                            </DialogDescription>
                        </DialogHeader>

                        <Form
                            {...payBill.form(selectedBill)}
                            className="space-y-4 pt-2"
                            onSuccess={() => setPaymentModalOpen(false)}
                        >
                            {({ errors, processing }) => (
                                <>
                                    <label className="flex items-center gap-2 rounded-lg border bg-muted/20 p-3 text-sm font-medium">
                                        <input
                                            type="checkbox"
                                            checked={splitPayment}
                                            onChange={(event) =>
                                                setSplitPayment(
                                                    event.target.checked,
                                                )
                                            }
                                        />
                                        Dividir entre dos métodos de pago
                                    </label>

                                    {/* Método de pago */}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">
                                            Método de Pago
                                        </Label>
                                        <input
                                            type="hidden"
                                            name="payment_method"
                                            value={paymentMethod}
                                        />
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                            {[
                                                {
                                                    id: 'efectivo',
                                                    label: 'Efectivo',
                                                    icon: Banknote,
                                                },
                                                {
                                                    id: 'tarjeta',
                                                    label: 'Tarjeta POS',
                                                    icon: CreditCard,
                                                },
                                                {
                                                    id: 'yape',
                                                    label: 'Yape',
                                                    icon: QrCode,
                                                },
                                                {
                                                    id: 'plin',
                                                    label: 'Plin',
                                                    icon: QrCode,
                                                },
                                            ].map((m) => {
                                                const Icon = m.icon;
                                                const isSelected =
                                                    paymentMethod === m.id;

                                                return (
                                                    <Button
                                                        key={m.id}
                                                        type="button"
                                                        variant={
                                                            isSelected
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                        size="sm"
                                                        className="flex h-auto flex-col gap-1 py-3"
                                                        onClick={() => {
                                                            const method =
                                                                m.id as PaymentMethod;
                                                            setPaymentMethod(
                                                                method,
                                                            );
                                                            if (
                                                                secondPaymentMethod ===
                                                                method
                                                            ) {
                                                                setSecondPaymentMethod(
                                                                    method ===
                                                                        'efectivo'
                                                                        ? 'yape'
                                                                        : 'efectivo',
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <Icon className="size-4" />
                                                        <span className="text-xs">
                                                            {m.label}
                                                        </span>
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                        {errors.payment_method && (
                                            <p className="text-xs text-destructive">
                                                {errors.payment_method}
                                            </p>
                                        )}
                                    </div>

                                    {splitPayment && (
                                        <div className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2">
                                            <input
                                                type="hidden"
                                                name="payments[0][payment_method]"
                                                value={paymentMethod}
                                            />
                                            <div className="space-y-1.5">
                                                <Label
                                                    htmlFor="first_payment_amount"
                                                    className="text-xs"
                                                >
                                                    Primer importe (S/)
                                                </Label>
                                                <Input
                                                    id="first_payment_amount"
                                                    name="payments[0][amount]"
                                                    type="number"
                                                    min="0.01"
                                                    max={
                                                        selectedBill.balance -
                                                        0.01
                                                    }
                                                    step="0.01"
                                                    value={firstPaymentAmount}
                                                    onChange={(event) =>
                                                        setFirstPaymentAmount(
                                                            event.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label
                                                    htmlFor="second_payment_method"
                                                    className="text-xs"
                                                >
                                                    Segundo método
                                                </Label>
                                                <select
                                                    id="second_payment_method"
                                                    name="payments[1][payment_method]"
                                                    value={secondPaymentMethod}
                                                    onChange={(event) =>
                                                        setSecondPaymentMethod(
                                                            event.target
                                                                .value as PaymentMethod,
                                                        )
                                                    }
                                                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                                >
                                                    {(
                                                        [
                                                            'efectivo',
                                                            'tarjeta',
                                                            'yape',
                                                            'plin',
                                                        ] as PaymentMethod[]
                                                    )
                                                        .filter(
                                                            (method) =>
                                                                method !==
                                                                paymentMethod,
                                                        )
                                                        .map((method) => (
                                                            <option
                                                                key={method}
                                                                value={method}
                                                            >
                                                                {method}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label
                                                    htmlFor="second_payment_amount"
                                                    className="text-xs"
                                                >
                                                    Importe restante (S/)
                                                </Label>
                                                <Input
                                                    id="second_payment_amount"
                                                    name="payments[1][amount]"
                                                    value={Math.max(
                                                        0,
                                                        selectedBill.balance -
                                                            (Number(
                                                                firstPaymentAmount,
                                                            ) || 0),
                                                    ).toFixed(2)}
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Importes */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label
                                                htmlFor="amount"
                                                className="text-xs"
                                            >
                                                Importe a Cobrar (S/)
                                            </Label>
                                            <Input
                                                id="amount"
                                                name="amount"
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                max={selectedBill.balance}
                                                value={paymentAmount}
                                                onChange={(e) =>
                                                    setPaymentAmount(
                                                        e.target.value,
                                                    )
                                                }
                                                className="text-base font-bold"
                                                required
                                            />
                                            {errors.amount && (
                                                <p className="text-xs text-destructive">
                                                    {errors.amount}
                                                </p>
                                            )}
                                        </div>

                                        {paymentMethod === 'efectivo' && (
                                            <div className="space-y-1.5">
                                                <Label
                                                    htmlFor="received_amount"
                                                    className="text-xs"
                                                >
                                                    Efectivo Recibido (S/)
                                                </Label>
                                                <Input
                                                    id="received_amount"
                                                    name="received_amount"
                                                    type="number"
                                                    step="0.01"
                                                    min="0.01"
                                                    value={receivedAmount}
                                                    onChange={(e) =>
                                                        setReceivedAmount(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="bg-emerald-50/20 text-base font-bold"
                                                    autoFocus
                                                />
                                                {errors.received_amount && (
                                                    <p className="text-xs text-destructive">
                                                        {errors.received_amount}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Cálculo de Vuelto */}
                                    {paymentMethod === 'efectivo' && (
                                        <div className="flex items-center justify-between rounded-lg border bg-emerald-50/30 p-3 dark:bg-emerald-950/20">
                                            <span className="text-xs font-medium text-muted-foreground">
                                                Vuelto a entregar al cliente:
                                            </span>
                                            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                                {formatCurrency(
                                                    calculatedChange(),
                                                )}
                                            </span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label
                                                htmlFor="receipt_type"
                                                className="text-xs"
                                            >
                                                Tipo de comprobante
                                            </Label>
                                            <select
                                                id="receipt_type"
                                                name="receipt_type"
                                                value={receiptType}
                                                onChange={(event) =>
                                                    setReceiptType(
                                                        event.target.value as
                                                            | 'ticket'
                                                            | 'boleta'
                                                            | 'factura',
                                                    )
                                                }
                                                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                            >
                                                <option value="ticket">
                                                    Ticket
                                                </option>
                                                <option value="boleta">
                                                    Boleta
                                                </option>
                                                <option value="factura">
                                                    Factura
                                                </option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label
                                                htmlFor="customer_document"
                                                className="text-xs"
                                            >
                                                Documento del cliente
                                            </Label>
                                            <Input
                                                id="customer_document"
                                                name="customer_document"
                                                value={customerDocument}
                                                onChange={(event) =>
                                                    setCustomerDocument(
                                                        event.target.value,
                                                    )
                                                }
                                                required={
                                                    receiptType === 'factura'
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="customer_name"
                                            className="text-xs"
                                        >
                                            Nombre o razón social
                                        </Label>
                                        <Input
                                            id="customer_name"
                                            name="customer_name"
                                            value={customerName}
                                            onChange={(event) =>
                                                setCustomerName(
                                                    event.target.value,
                                                )
                                            }
                                            required={receiptType === 'factura'}
                                        />
                                    </div>

                                    {/* Nro de Comprobante opcional */}
                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="receipt_number"
                                            className="text-xs"
                                        >
                                            N° Comprobante / Ticket (Opcional)
                                        </Label>
                                        <Input
                                            id="receipt_number"
                                            name="receipt_number"
                                            placeholder={`B001-${String(selectedBill.id).padStart(6, '0')}`}
                                            value={receiptNumber}
                                            onChange={(e) =>
                                                setReceiptNumber(e.target.value)
                                            }
                                        />
                                    </div>

                                    {/* Botones */}
                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                setPaymentModalOpen(false)
                                            }
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
                                            disabled={
                                                processing || !paymentAmount
                                            }
                                        >
                                            {processing
                                                ? 'Registrando...'
                                                : 'Confirmar Cobro y Liberar Mesa'}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            )}

            <Dialog
                open={movementModalOpen}
                onOpenChange={setMovementModalOpen}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Registrar movimiento de caja</DialogTitle>
                        <DialogDescription>
                            Registra ingresos, gastos, retiros o caja chica del
                            turno.
                        </DialogDescription>
                    </DialogHeader>
                    <Form
                        {...storeMovement.form()}
                        className="space-y-4"
                        onSuccess={() => setMovementModalOpen(false)}
                    >
                        {({ errors, processing }) => (
                            <>
                                <div className="space-y-1.5">
                                    <Label htmlFor="movement_type">Tipo</Label>
                                    <select
                                        id="movement_type"
                                        name="type"
                                        className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                        required
                                    >
                                        <option value="income">Ingreso</option>
                                        <option value="expense">Gasto</option>
                                        <option value="withdrawal">
                                            Retiro
                                        </option>
                                        <option value="petty_cash">
                                            Caja chica
                                        </option>
                                    </select>
                                    {errors.type && (
                                        <p className="text-xs text-destructive">
                                            {errors.type}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="movement_amount">
                                        Importe (S/)
                                    </Label>
                                    <Input
                                        id="movement_amount"
                                        name="amount"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        required
                                    />
                                    {errors.amount && (
                                        <p className="text-xs text-destructive">
                                            {errors.amount}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="movement_description">
                                        Descripción
                                    </Label>
                                    <Input
                                        id="movement_description"
                                        name="description"
                                        maxLength={255}
                                        required
                                    />
                                    {errors.description && (
                                        <p className="text-xs text-destructive">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setMovementModalOpen(false)
                                        }
                                    >
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing
                                            ? 'Guardando...'
                                            : 'Registrar'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Modal de Cierre de Caja */}
            {activeSession && (
                <Dialog
                    open={closeSessionModalOpen}
                    onOpenChange={setCloseSessionModalOpen}
                >
                    <DialogContent className="max-w-md p-6">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-lg">
                                <Lock className="size-5 text-destructive" />
                                Cierre y Arqueo de Turno de Caja
                            </DialogTitle>
                            <DialogDescription>
                                Realiza el conteo físico del dinero en efectivo
                                de la gaveta para el cuadre final.
                            </DialogDescription>
                        </DialogHeader>

                        <Form
                            {...closeCashRegister.form(activeSession)}
                            className="space-y-4 pt-2"
                            onSuccess={() => setCloseSessionModalOpen(false)}
                        >
                            {({ errors, processing }) => (
                                <>
                                    <div className="space-y-1 rounded-lg border bg-muted/20 p-3 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Fondo Inicial:
                                            </span>
                                            <span>
                                                {formatCurrency(
                                                    Number(
                                                        activeSession.opening_amount,
                                                    ),
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Ventas en Efectivo:
                                            </span>
                                            <span>
                                                {formatCurrency(
                                                    summary?.cash_total ?? 0,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-t pt-1 font-bold">
                                            <span>
                                                Efectivo Esperado en Gaveta:
                                            </span>
                                            <span className="text-primary">
                                                {formatCurrency(
                                                    expectedCashInDrawer,
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="closing_amount">
                                            Efectivo Real Contado en Gaveta (S/)
                                        </Label>
                                        <Input
                                            id="closing_amount"
                                            name="closing_amount"
                                            type="number"
                                            step="0.10"
                                            min="0"
                                            value={closingAmount}
                                            onChange={(e) =>
                                                setClosingAmount(e.target.value)
                                            }
                                            className="text-base font-bold"
                                            required
                                            autoFocus
                                        />
                                        {errors.closing_amount && (
                                            <p className="text-xs text-destructive">
                                                {errors.closing_amount}
                                            </p>
                                        )}
                                    </div>

                                    {/* Indicador de Diferencia / Descuadre */}
                                    <div
                                        className={`flex items-center justify-between rounded-lg border p-3 text-xs font-semibold ${
                                            Math.abs(closingDiff) < 0.01
                                                ? 'border-emerald-300 bg-emerald-100/50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300'
                                                : closingDiff > 0
                                                  ? 'border-blue-300 bg-blue-100/50 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300'
                                                  : 'border-red-300 bg-red-100/50 text-red-800 dark:bg-red-950/30 dark:text-red-300'
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
                                            {closingDiff >= 0
                                                ? `+ ${formatCurrency(closingDiff)}`
                                                : `- ${formatCurrency(Math.abs(closingDiff))}`}
                                        </span>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="notes"
                                            className="text-xs"
                                        >
                                            Observaciones de Cierre (Opcional)
                                        </Label>
                                        <Input
                                            id="notes"
                                            name="notes"
                                            placeholder="Ej. Billetes deteriorados, cambio guardado"
                                            value={closingNotes}
                                            onChange={(e) =>
                                                setClosingNotes(e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                setCloseSessionModalOpen(false)
                                            }
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="destructive"
                                            disabled={
                                                processing || !closingAmount
                                            }
                                        >
                                            {processing
                                                ? 'Cerrando caja...'
                                                : 'Confirmar Cierre de Caja'}
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
