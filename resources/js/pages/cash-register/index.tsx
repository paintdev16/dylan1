import { Form, Head, usePage, usePoll } from '@inertiajs/react';
import {
    AlertCircle,
    Banknote,
    CheckCircle2,
    CircleDollarSign,
    Clock,
    CreditCard,
    DollarSign,
    Eye,
    Lock,
    QrCode,
    Receipt,
    ReceiptText,
    TrendingUp,
    Utensils,
    Wallet,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
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
    OrderItem,
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

type TicketFlash = {
    number: string;
    print_url: string;
    download_url: string;
};

type FlashProps = {
    ticket?: TicketFlash | null;
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    cash: 'Efectivo',
    card: 'Tarjeta POS',
    yape: 'Yape',
    plin: 'Plin',
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

function consumptionItemName(item: OrderItem): string {
    if (item.product) {
        return `${item.product.name}${item.product.presentation ? ` ${item.product.presentation}` : ''}`;
    }

    return item.menu_modality?.name ?? 'Consumo';
}

function consumptionItemComponents(item: OrderItem): string[] {
    return (item.daily_menu_products ?? [])
        .map((dailyMenuProduct) => dailyMenuProduct.product?.name)
        .filter((name): name is string => Boolean(name));
}

type GroupedConsumptionItem = {
    key: string;
    name: string;
    components: string[];
    notes: string | null;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    isCancelled: boolean;
};

function groupedConsumptionItems(bill: Bill | null): GroupedConsumptionItem[] {
    const groupedItems = new Map<string, GroupedConsumptionItem>();

    for (const order of bill?.orders ?? []) {
        for (const item of order.items ?? []) {
            const components = consumptionItemComponents(item);
            const name = consumptionItemName(item);
            const key = [
                item.product_id ?? `modality-${item.menu_modality_id}`,
                components.join('|'),
                item.notes ?? '',
                Number(item.unit_price),
                item.is_cancelled ? 'cancelled' : 'active',
            ].join(':');
            const current = groupedItems.get(key);

            if (current) {
                current.quantity += Number(item.quantity);
                current.subtotal += Number(item.subtotal);
                continue;
            }

            groupedItems.set(key, {
                key,
                name,
                components,
                notes: item.notes,
                quantity: Number(item.quantity),
                unitPrice: Number(item.unit_price),
                subtotal: Number(item.subtotal),
                isCancelled: Boolean(item.is_cancelled),
            });
        }
    }

    return [...groupedItems.values()];
}

export default function CashRegisterIndex({
    activeSession,
    summary,
    pendingBills,
    pastSessions,
    cancellationRequests,
}: Props) {
    const isMobile = useIsMobile();
    const { flash } = usePage<{ flash: FlashProps }>().props;
    const [ticket, setTicket] = useState<TicketFlash | null>(null);
    const [ticketPreviewOpen, setTicketPreviewOpen] = useState(false);

    useEffect(() => {
        if (flash.ticket?.print_url) {
            setTicket(flash.ticket);
            setTicketPreviewOpen(true);
        }
    }, [flash.ticket?.print_url]);

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
    const [detailBill, setDetailBill] = useState<Bill | null>(null);
    const [closeSessionModalOpen, setCloseSessionModalOpen] = useState(false);
    const [movementModalOpen, setMovementModalOpen] = useState(false);

    // Payment Form state
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
    const [paymentAmount, setPaymentAmount] = useState<string>('');
    const [receivedAmount, setReceivedAmount] = useState<string>('');
    const [splitPayment, setSplitPayment] = useState(false);
    const [firstPaymentAmount, setFirstPaymentAmount] = useState<string>('');
    const [secondPaymentMethod, setSecondPaymentMethod] =
        useState<PaymentMethod>('yape');
    const [receiptType, setReceiptType] = useState<
        'ticket' | 'receipt' | 'invoice'
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
        setPaymentMethod('cash');
        setSplitPayment(false);
        setFirstPaymentAmount((bill.balance / 2).toFixed(2));
        setSecondPaymentMethod('yape');
        setReceiptType('ticket');
        setCustomerName('');
        setCustomerDocument('');
    };

    const calculatedChange = () => {
        const pay = parseFloat(paymentAmount) || 0;
        const rec = parseFloat(receivedAmount) || 0;
        return Math.max(0, rec - pay);
    };

    const expectedCashInDrawer = summary?.expected_cash ?? 0;
    const closingDiff = (parseFloat(closingAmount) || 0) - expectedCashInDrawer;
    const detailConsumptionItems = groupedConsumptionItems(detailBill);

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
                            <Badge className="gap-1.5 bg-success-soft px-3 py-1 text-xs font-medium text-success">
                                <span className="size-2 animate-pulse rounded-full bg-success" />
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

                {ticket && (
                    <div className="flex flex-col gap-3 rounded-2xl border border-success/30 bg-success-soft p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="font-semibold text-success">
                                Ticket generado correctamente
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Comprobante {ticket.number}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setTicketPreviewOpen(true)}
                            >
                                Imprimir ticket
                            </Button>
                            <Button
                                type="button"
                                onClick={() =>
                                    window.open(ticket.download_url, '_blank')
                                }
                            >
                                Descargar PDF
                            </Button>
                        </div>
                    </div>
                )}

                {/* Si no hay sesión activa: Apertura de Caja */}
                {!activeSession ? (
                    <div className="mx-auto my-8 max-w-lg space-y-6 rounded-2xl border bg-card p-8 text-center shadow-sm">
                        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
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
                                        className="w-full bg-success py-5 font-semibold text-success-foreground hover:bg-success"
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
                            <div className="space-y-2 rounded-xl border border-primary/25 bg-primary-soft p-4 shadow-sm">
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

                            <div className="space-y-2 rounded-xl border border-cash/25 bg-cash-soft p-4 shadow-sm">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Efectivo en Gaveta</span>
                                    <Banknote className="size-4 text-cash" />
                                </div>
                                <p className="text-2xl font-bold text-cash">
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

                            <div className="space-y-2 rounded-xl border border-card-payment/25 bg-card-payment-soft p-4 shadow-sm">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Tarjetas & Digital</span>
                                    <CreditCard className="size-4 text-card-payment" />
                                </div>
                                <p className="text-2xl font-bold text-card-payment">
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

                            <div className="space-y-2 rounded-xl border border-sales/25 bg-sales-soft p-4 shadow-sm">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Total Ventas Turno</span>
                                    <TrendingUp className="size-4 text-sales" />
                                </div>
                                <p className="text-2xl font-bold text-sales">
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
                                                    <TableCell className="text-right font-bold text-success">
                                                        {formatCurrency(
                                                            Number(
                                                                bill.balance,
                                                            ),
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 gap-1.5 border-info/30 text-xs font-semibold text-info hover:bg-info-soft hover:text-info"
                                                                onClick={() =>
                                                                    setDetailBill(
                                                                        bill,
                                                                    )
                                                                }
                                                            >
                                                                <Eye className="size-3.5" />
                                                                Detalle
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="h-8 gap-1.5 bg-success text-xs font-semibold text-success-foreground hover:bg-success"
                                                                onClick={() =>
                                                                    handleOpenPayment(
                                                                        bill,
                                                                    )
                                                                }
                                                            >
                                                                <Banknote className="size-3.5" />
                                                                Cobrar
                                                            </Button>
                                                        </div>
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
                                                    <CheckCircle2 className="mx-auto mb-2 size-8 text-success" />
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

            {/* Drawer de Detalle de Consumo */}
            {detailBill && (
                <Drawer
                    open={detailBill !== null}
                    onOpenChange={(open) => {
                        if (!open) setDetailBill(null);
                    }}
                    showSwipeHandle={isMobile}
                    swipeDirection={isMobile ? 'down' : 'right'}
                >
                    <DrawerContent className="overflow-y-auto">
                        <DrawerHeader className="border-b px-4 py-4 sm:px-6">
                            <DrawerTitle className="flex items-center gap-2 text-lg">
                                <ReceiptText className="size-5 text-info" />
                                Detalle de Cuenta #{detailBill.id}
                            </DrawerTitle>
                            <DrawerDescription>
                                {detailBill.order_type === 'dine_in'
                                    ? `Mesa #${detailBill.restaurant_table?.number ?? 'Sin mesa'}`
                                    : 'Pedido para llevar'}{' '}
                                · Mozo:{' '}
                                {detailBill.opening_waiter?.name ?? 'Sin mozo'}
                            </DrawerDescription>
                        </DrawerHeader>

                        <div className="space-y-5 p-4 sm:p-6">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="rounded-xl border border-sales/25 bg-sales-soft p-3">
                                    <p className="text-xs text-muted-foreground">
                                        Consumo
                                    </p>
                                    <p className="mt-1 font-bold text-sales">
                                        {formatCurrency(
                                            detailBill.total_amount,
                                        )}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-cash/25 bg-cash-soft p-3">
                                    <p className="text-xs text-muted-foreground">
                                        Pagado
                                    </p>
                                    <p className="mt-1 font-bold text-cash">
                                        {formatCurrency(detailBill.paid_amount)}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-warning/25 bg-warning-soft p-3">
                                    <p className="text-xs text-muted-foreground">
                                        Pendiente
                                    </p>
                                    <p className="mt-1 font-bold text-warning">
                                        {formatCurrency(detailBill.balance)}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {detailConsumptionItems.length > 0 && (
                                    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                                        <div className="flex items-center justify-between border-b bg-primary-soft/50 px-4 py-3">
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    Consumo agrupado de la
                                                    sesión
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Todas las comandas
                                                    pertenecen a esta misma
                                                    cuenta.
                                                </p>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className="border-card-primary-border bg-card-primary text-primary"
                                            >
                                                {
                                                    (detailBill.orders ?? [])
                                                        .length
                                                }{' '}
                                                {(detailBill.orders ?? [])
                                                    .length === 1
                                                    ? 'comanda'
                                                    : 'comandas'}
                                            </Badge>
                                        </div>

                                        <div className="divide-y">
                                            {detailConsumptionItems.map(
                                                (item) => (
                                                    <div
                                                        key={item.key}
                                                        className={`flex items-start justify-between gap-4 p-4 ${item.isCancelled ? 'bg-destructive-soft/50 opacity-70' : ''}`}
                                                    >
                                                        <div className="min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <p className="font-medium">
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                    ×{' '}
                                                                    {item.name}
                                                                </p>
                                                                {item.isCancelled && (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="border-destructive-border bg-destructive-soft text-destructive"
                                                                    >
                                                                        Cancelado
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            {item.components
                                                                .length > 0 && (
                                                                <p className="mt-1 text-xs text-primary">
                                                                    {item.components.join(
                                                                        ' + ',
                                                                    )}
                                                                </p>
                                                            )}

                                                            {item.notes && (
                                                                <p className="mt-1 text-xs text-warning italic">
                                                                    “
                                                                    {item.notes}
                                                                    ”
                                                                </p>
                                                            )}

                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                {formatCurrency(
                                                                    item.unitPrice,
                                                                )}{' '}
                                                                c/u
                                                            </p>
                                                        </div>

                                                        <p className="shrink-0 font-semibold">
                                                            {formatCurrency(
                                                                item.subtotal,
                                                            )}
                                                        </p>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                                {detailConsumptionItems.length === 0 && (
                                    <div className="rounded-xl border border-dashed border-info/25 bg-info-soft/40 p-8 text-center">
                                        <Receipt className="mx-auto mb-2 size-8 text-info" />
                                        <p className="text-sm font-medium">
                                            Esta cuenta no tiene consumos.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between rounded-xl border border-sales/25 bg-sales-soft p-4">
                                <span className="font-semibold">
                                    Total consumido
                                </span>
                                <span className="text-xl font-bold text-sales">
                                    {formatCurrency(detailBill.total_amount)}
                                </span>
                            </div>

                            <Button
                                type="button"
                                className="w-full bg-success text-success-foreground hover:bg-success"
                                onClick={() => {
                                    const bill = detailBill;
                                    setDetailBill(null);
                                    handleOpenPayment(bill);
                                }}
                            >
                                <Banknote className="size-4" />
                                Cobrar esta cuenta
                            </Button>
                        </div>
                    </DrawerContent>
                </Drawer>
            )}

            {/* Drawer de Cobro */}
            {selectedBill && (
                <Drawer
                    open={selectedBill !== null}
                    onOpenChange={(open) => {
                        if (!open) setSelectedBill(null);
                    }}
                    showSwipeHandle={isMobile}
                    swipeDirection={isMobile ? 'down' : 'right'}
                >
                    <DrawerContent className="overflow-y-auto">
                        <DrawerHeader className="border-b px-4 py-4 sm:px-6">
                            <DrawerTitle className="flex items-center gap-2 text-lg">
                                <DollarSign className="size-5 text-success" />
                                Cobrar Cuenta #{selectedBill.id}
                            </DrawerTitle>
                            <DrawerDescription>
                                {selectedBill.order_type === 'dine_in'
                                    ? `Mesa #${selectedBill.restaurant_table?.number ?? 'Sin mesa'}`
                                    : 'Pedido Para Llevar'}
                                {' · Saldo a Liquidar: '}
                                <strong className="font-bold text-success">
                                    {formatCurrency(selectedBill.balance)}
                                </strong>
                            </DrawerDescription>
                        </DrawerHeader>

                        <Form
                            {...payBill.form(selectedBill)}
                            className="space-y-4 p-4 sm:p-6"
                            onSuccess={() => setSelectedBill(null)}
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
                                                    id: 'cash',
                                                    label: 'Efectivo',
                                                    icon: Banknote,
                                                },
                                                {
                                                    id: 'card',
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
                                                                        'cash'
                                                                        ? 'yape'
                                                                        : 'cash',
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
                                                            'cash',
                                                            'card',
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
                                                                {
                                                                    PAYMENT_METHOD_LABELS[
                                                                        method
                                                                    ]
                                                                }
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

                                        {paymentMethod === 'cash' && (
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
                                                    className="bg-success-soft text-base font-bold"
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
                                    {paymentMethod === 'cash' && (
                                        <div className="flex items-center justify-between rounded-lg border bg-success-soft p-3">
                                            <span className="text-xs font-medium text-muted-foreground">
                                                Vuelto a entregar al cliente:
                                            </span>
                                            <span className="text-lg font-bold text-success">
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
                                                            | 'receipt'
                                                            | 'invoice',
                                                    )
                                                }
                                                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                                            >
                                                <option value="ticket">
                                                    Ticket
                                                </option>
                                                <option value="receipt">
                                                    Boleta
                                                </option>
                                                <option value="invoice">
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
                                        />
                                    </div>

                                    {/* Botones */}
                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                setSelectedBill(null)
                                            }
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="bg-success font-semibold text-success-foreground hover:bg-success"
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
                    </DrawerContent>
                </Drawer>
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
                                                ? 'border-card-success-border bg-success-soft text-success'
                                                : closingDiff > 0
                                                  ? 'border-card-info-border bg-info-soft text-info'
                                                  : 'border-destructive-border bg-destructive-soft text-destructive'
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

            {ticket && (
                <Drawer
                    open={ticketPreviewOpen}
                    disablePointerDismissal
                    onOpenChange={(open) => {
                        if (open) {
                            setTicketPreviewOpen(true);
                        }
                    }}
                    showSwipeHandle={isMobile}
                    swipeDirection={isMobile ? 'down' : 'right'}
                >
                    <DrawerContent className="max-h-[95vh] overflow-y-auto">
                        <DrawerHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <DrawerTitle>Ticket generado</DrawerTitle>
                                    <DrawerDescription>
                                        Comprobante {ticket.number}
                                    </DrawerDescription>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setTicketPreviewOpen(false)}
                                >
                                    Cerrar
                                </Button>
                            </div>
                        </DrawerHeader>
                        <div className="flex flex-1 justify-center overflow-auto bg-muted/40 p-4">
                            <iframe
                                title={`Vista previa del ticket ${ticket.number}`}
                                src={`${ticket.print_url}?preview=1`}
                                className="h-[520px] w-full max-w-sm rounded-lg border bg-white shadow-sm"
                            />
                        </div>
                        <div className="grid gap-2 border-t p-4 sm:grid-cols-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    window.open(ticket.print_url, '_blank')
                                }
                            >
                                Imprimir ticket
                            </Button>
                            <Button
                                type="button"
                                onClick={() =>
                                    window.open(ticket.download_url, '_blank')
                                }
                            >
                                Descargar PDF
                            </Button>
                        </div>
                    </DrawerContent>
                </Drawer>
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
