import { Form, Head } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    Banknote,
    BarChart3,
    Calendar as CalendarIcon,
    CreditCard,
    Eye,
    Filter,
    ReceiptText,
    Smartphone,
    Trophy,
} from 'lucide-react';
import * as React from 'react';

import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { index } from '@/routes/reports';

type Props = {
    filters: {
        from: string;
        to: string;
    };
    summary: {
        total: number;
        transactions: number;
        cash: number;
        card: number;
        digital: number;
    };
    topProducts: Array<{
        id: number;
        type: 'product' | 'economic_menu';
        name: string;
        quantity_sold: number;
        sales_total: number;
    }>;
    payments: Array<{
        id: number;
        bill_id: number;
        table_number: number | null;
        order_type: 'dine_in' | 'takeout';
        cashier_name: string;
        payment_method: 'cash' | 'card' | 'yape' | 'plin';
        amount: number;
        operation_code: string | null;
        receipt_type: 'ticket' | 'receipt' | 'invoice';
        receipt_number: string | null;
        customer_name: string | null;
        customer_document: string | null;
        paid_at: string;
        receipt_print_url: string | null;
        receipt_download_url: string | null;
    }>;
};

const money = (value: number) => `S/. ${Number(value).toFixed(2)}`;

function parseDate(value?: string): Date | undefined {
    if (!value) {
        return undefined;
    }

    const [year, month, day] = value.split('-').map(Number);

    if (!year || !month || !day) {
        return undefined;
    }

    return new Date(year, month - 1, day);
}

const paymentMethodLabels = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    yape: 'Yape',
    plin: 'Plin',
} as const;

const receiptTypeLabels = {
    ticket: 'Ticket',
    receipt: 'Boleta',
    invoice: 'Factura',
} as const;

const paymentMethodStyles = {
    cash: 'border-cash/25 bg-cash-soft text-cash',
    card: 'border-card-payment/25 bg-card-payment-soft text-card-payment',
    yape: 'border-digital-payment/25 bg-digital-payment-soft text-digital-payment',
    plin: 'border-digital-payment/25 bg-digital-payment-soft text-digital-payment',
} as const;

export default function ReportsIndex({
    filters,
    summary,
    topProducts,
    payments,
}: Props) {
    const [fromDate, setFromDate] = React.useState<Date | undefined>(
        parseDate(filters.from),
    );

    const [toDate, setToDate] = React.useState<Date | undefined>(
        parseDate(filters.to),
    );
    const [selectedPayment, setSelectedPayment] = React.useState<
        Props['payments'][number] | null
    >(null);
    const isMobile = useIsMobile();

    const paymentCards = [
        [
            'Efectivo',
            money(summary.cash),
            Banknote,
            'border-cash/25 bg-cash-soft',
            'bg-card/70 text-cash dark:bg-cash dark:text-primary-foreground',
            'text-cash',
        ],
        [
            'Tarjeta',
            money(summary.card),
            CreditCard,
            'border-card-payment/25 bg-card-payment-soft',
            'bg-card/70 text-card-payment dark:bg-card-payment dark:text-primary-foreground',
            'text-card-payment',
        ],
        [
            'Yape / Plin',
            money(summary.digital),
            Smartphone,
            'border-digital-payment/25 bg-digital-payment-soft',
            'bg-card/70 text-digital-payment dark:bg-digital-payment dark:text-primary-foreground',
            'text-digital-payment',
        ],
    ] as const;

    const highestQuantity = Math.max(
        ...topProducts.map((product) => product.quantity_sold),
        1,
    );
    const activeFromDate = parseDate(filters.from);
    const activeToDate = parseDate(filters.to);
    const activePeriod =
        activeFromDate && activeToDate
            ? filters.from === filters.to
                ? format(activeFromDate, 'dd MMM yyyy')
                : `${format(activeFromDate, 'dd MMM')} — ${format(activeToDate, 'dd MMM yyyy')}`
            : 'Sin periodo';
    const averageTicket =
        summary.transactions > 0 ? summary.total / summary.transactions : 0;

    return (
        <>
            <Head title="Reportes" />

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title="Reportes"
                    description="Analiza cobros, medios de pago y productos vendidos en un solo lugar."
                />

                <div className="flex flex-col items-stretch gap-4 xl:flex-row">
                    <Form
                        {...index.form()}
                        className="flex w-full flex-col gap-3 rounded-xl border bg-card p-3 shadow-sm lg:w-fit lg:flex-row lg:items-center"
                    >
                        <div className="flex items-center gap-3 lg:pr-2">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                                <Filter className="size-4" />
                            </div>

                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold">
                                    Rango de fechas
                                </h2>
                            </div>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-[minmax(150px,1fr)_auto_minmax(150px,1fr)_auto] sm:items-center">
                            <div>
                                <input
                                    type="hidden"
                                    name="from"
                                    value={
                                        fromDate
                                            ? format(fromDate, 'yyyy-MM-dd')
                                            : ''
                                    }
                                />

                                <Popover>
                                    <PopoverTrigger
                                        render={
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className={cn(
                                                    'w-full justify-start bg-background text-left font-normal',
                                                    !fromDate &&
                                                        'text-muted-foreground',
                                                )}
                                            />
                                        }
                                    >
                                        <CalendarIcon className="mr-2 size-4" />

                                        {fromDate ? (
                                            format(fromDate, 'dd/MM/yyyy')
                                        ) : (
                                            <span>Seleccionar fecha</span>
                                        )}
                                    </PopoverTrigger>

                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={fromDate}
                                            onSelect={setFromDate}
                                            disabled={(date) =>
                                                toDate ? date > toDate : false
                                            }
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <span className="hidden text-sm text-muted-foreground sm:block">
                                a
                            </span>

                            <div>
                                <input
                                    type="hidden"
                                    name="to"
                                    value={
                                        toDate
                                            ? format(toDate, 'yyyy-MM-dd')
                                            : ''
                                    }
                                />

                                <Popover>
                                    <PopoverTrigger
                                        render={
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className={cn(
                                                    'w-full justify-start bg-background text-left font-normal',
                                                    !toDate &&
                                                        'text-muted-foreground',
                                                )}
                                            />
                                        }
                                    >
                                        <CalendarIcon className="mr-2 size-4" />

                                        {toDate ? (
                                            format(toDate, 'dd/MM/yyyy')
                                        ) : (
                                            <span>Seleccionar fecha</span>
                                        )}
                                    </PopoverTrigger>

                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={toDate}
                                            onSelect={setToDate}
                                            disabled={(date) =>
                                                fromDate
                                                    ? date < fromDate
                                                    : false
                                            }
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <Button type="submit" className="w-full sm:w-auto">
                                Aplicar
                            </Button>
                        </div>
                    </Form>

                    <div className="grid min-w-0 flex-1 grid-cols-1 divide-y overflow-hidden rounded-xl border bg-card shadow-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                        <div className="flex min-w-0 items-center gap-3 px-4 py-3 sm:px-5">
                            <CalendarIcon className="size-5 shrink-0 text-primary" />
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                    Periodo activo
                                </p>
                                <p className="truncate text-sm font-semibold">
                                    {activePeriod}
                                </p>
                            </div>
                        </div>

                        <div className="flex min-w-0 items-center gap-3 px-4 py-3 sm:px-5">
                            <ReceiptText className="size-5 shrink-0 text-cash" />
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                    Cobros registrados
                                </p>
                                <p className="truncate text-sm font-semibold">
                                    {summary.transactions} movimientos
                                </p>
                            </div>
                        </div>

                        <div className="flex min-w-0 items-center gap-3 px-4 py-3 sm:px-5">
                            <BarChart3 className="size-5 shrink-0 text-sales" />
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                    Ticket promedio
                                </p>
                                <p className="truncate text-sm font-semibold">
                                    {money(averageTicket)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <section className="space-y-3">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Resumen financiero
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Rendimiento del periodo seleccionado.
                            </p>
                        </div>

                        <Badge variant="outline">
                            {summary.transactions} cobros
                        </Badge>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                        <div className="relative overflow-hidden rounded-2xl border border-sales/25 bg-sales-soft p-5 shadow-sm sm:col-span-2">
                            <div className="absolute -top-8 -right-8 size-32 rounded-full bg-sales/10" />

                            <div className="relative flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Ventas totales
                                    </p>
                                    <p className="mt-2 text-3xl font-bold tracking-tight text-sales sm:text-4xl">
                                        {money(summary.total)}
                                    </p>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Total efectivamente cobrado
                                    </p>
                                </div>

                                <div className="flex size-11 items-center justify-center rounded-xl bg-card/70 text-sales shadow-sm dark:bg-sales dark:text-primary-foreground">
                                    <BarChart3 className="size-6" />
                                </div>
                            </div>
                        </div>

                        {paymentCards.map(
                            ([
                                label,
                                value,
                                Icon,
                                panelClass,
                                iconClass,
                                valueClass,
                            ]) => (
                                <div
                                    key={label}
                                    className={cn(
                                        'rounded-2xl border p-4 shadow-sm transition-shadow hover:shadow-md',
                                        panelClass,
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'flex size-9 items-center justify-center rounded-lg shadow-sm',
                                            iconClass,
                                        )}
                                    >
                                        <Icon className="size-5" />
                                    </div>

                                    <p className="mt-3 text-sm text-muted-foreground">
                                        {label}
                                    </p>

                                    <p
                                        className={cn(
                                            'text-2xl font-bold',
                                            valueClass,
                                        )}
                                    >
                                        {value}
                                    </p>
                                </div>
                            ),
                        )}
                    </div>
                </section>

                <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2.2fr)_minmax(300px,0.8fr)]">
                    <section className="order-2 overflow-hidden rounded-2xl border bg-card shadow-sm">
                        <div className="border-b bg-primary-soft/45 px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                                    <Trophy className="size-5" />
                                </div>

                                <div>
                                    <h2 className="font-semibold">
                                        Más vendidos
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Productos y menús preferidos
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-1 p-3 sm:grid-cols-2 xl:grid-cols-1">
                            {topProducts.length > 0 ? (
                                topProducts.map((product, index) => (
                                    <div
                                        key={`${product.type}-${product.id}`}
                                        className="rounded-xl p-3 transition-colors hover:bg-muted/45"
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-sm font-bold text-primary">
                                                {index + 1}
                                            </span>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium">
                                                            {product.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {product.type ===
                                                            'economic_menu'
                                                                ? 'Menú económico'
                                                                : 'Plato o bebida'}
                                                        </p>
                                                    </div>

                                                    <span className="shrink-0 text-sm font-semibold">
                                                        {money(
                                                            product.sales_total,
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="mt-2 flex items-center gap-2">
                                                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className="h-full rounded-full bg-primary"
                                                            style={{
                                                                width: `${(product.quantity_sold / highestQuantity) * 100}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {product.quantity_sold}{' '}
                                                        uds.
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="py-6 text-center text-sm text-muted-foreground">
                                    No hay productos ni menús vendidos en este
                                    periodo.
                                </p>
                            )}
                        </div>
                    </section>

                    <section className="order-1 min-w-0 overflow-hidden rounded-2xl border bg-card shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-surface-secondary/20 px-5 py-4">
                            <div className="flex items-center gap-2">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                                    <ReceiptText className="size-5" />
                                </div>

                                <div>
                                    <h2 className="font-semibold">
                                        Historial de cobros
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Detalle de cada movimiento registrado
                                    </p>
                                </div>
                            </div>

                            <Badge variant="secondary">
                                {payments.length} movimientos
                            </Badge>
                        </div>

                        {payments.length > 0 ? (
                            <>
                                <div>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>
                                                    Fecha y hora
                                                </TableHead>
                                                <TableHead>
                                                    Mesa / pedido
                                                </TableHead>
                                                <TableHead className="hidden sm:table-cell">
                                                    Método
                                                </TableHead>
                                                <TableHead className="hidden md:table-cell">
                                                    Comprobante
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Monto
                                                </TableHead>
                                                <TableHead className="w-12">
                                                    <span className="sr-only">
                                                        Detalle
                                                    </span>
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody>
                                            {payments.map((payment) => (
                                                <TableRow key={payment.id}>
                                                    <TableCell className="whitespace-normal">
                                                        <div className="font-medium">
                                                            {format(
                                                                new Date(
                                                                    payment.paid_at,
                                                                ),
                                                                'dd/MM/yy',
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {format(
                                                                new Date(
                                                                    payment.paid_at,
                                                                ),
                                                                'HH:mm',
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium whitespace-normal">
                                                        {payment.table_number !==
                                                        null
                                                            ? `Mesa ${payment.table_number}`
                                                            : payment.order_type ===
                                                                'takeout'
                                                              ? 'Para llevar'
                                                              : 'Sin mesa'}
                                                    </TableCell>
                                                    <TableCell className="hidden sm:table-cell">
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                paymentMethodStyles[
                                                                    payment
                                                                        .payment_method
                                                                ]
                                                            }
                                                        >
                                                            {
                                                                paymentMethodLabels[
                                                                    payment
                                                                        .payment_method
                                                                ]
                                                            }
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        <div className="font-medium">
                                                            {
                                                                receiptTypeLabels[
                                                                    payment
                                                                        .receipt_type
                                                                ]
                                                            }
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {payment.receipt_number ??
                                                                'Sin número'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold text-sales">
                                                        {money(payment.amount)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label={`Ver detalle del cobro ${payment.id}`}
                                                            onClick={() =>
                                                                setSelectedPayment(
                                                                    payment,
                                                                )
                                                            }
                                                        >
                                                            <Eye className="size-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="hidden">
                                    {payments.map((payment) => (
                                        <div
                                            key={payment.id}
                                            className="space-y-3 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-semibold">
                                                        {payment.table_number !==
                                                        null
                                                            ? `Mesa ${payment.table_number}`
                                                            : 'Para llevar'}
                                                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                                                            Cuenta #
                                                            {payment.bill_id}
                                                        </span>
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {format(
                                                            new Date(
                                                                payment.paid_at,
                                                            ),
                                                            'dd/MM/yyyy · HH:mm',
                                                        )}
                                                    </p>
                                                </div>

                                                <p className="shrink-0 font-bold text-sales">
                                                    {money(payment.amount)}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        paymentMethodStyles[
                                                            payment
                                                                .payment_method
                                                        ]
                                                    }
                                                >
                                                    {
                                                        paymentMethodLabels[
                                                            payment
                                                                .payment_method
                                                        ]
                                                    }
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {
                                                        receiptTypeLabels[
                                                            payment.receipt_type
                                                        ]
                                                    }{' '}
                                                    {payment.receipt_number ??
                                                        'sin número'}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Cajero
                                                    </p>
                                                    <p>
                                                        {payment.cashier_name}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Cliente
                                                    </p>
                                                    <p className="truncate">
                                                        {payment.customer_name ??
                                                            '—'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                                No se registraron cobros en el periodo
                                seleccionado.
                            </p>
                        )}
                    </section>
                </div>
            </div>

            <Drawer
                open={selectedPayment !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedPayment(null);
                    }
                }}
                showSwipeHandle={isMobile}
                swipeDirection={isMobile ? 'down' : 'right'}
            >
                <DrawerContent className="overflow-y-auto">
                    {selectedPayment && (
                        <>
                            <DrawerHeader>
                                <DrawerTitle>Detalle del cobro</DrawerTitle>
                                <DrawerDescription>
                                    Cuenta #{selectedPayment.bill_id} ·{' '}
                                    {format(
                                        new Date(selectedPayment.paid_at),
                                        'dd/MM/yyyy HH:mm',
                                    )}
                                </DrawerDescription>
                            </DrawerHeader>

                            <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
                                <div className="rounded-2xl border border-sales/25 bg-sales-soft p-4">
                                    <p className="text-sm text-muted-foreground">
                                        Monto cobrado
                                    </p>
                                    <p className="text-3xl font-bold text-sales">
                                        {money(selectedPayment.amount)}
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    {[
                                        [
                                            'Mesa / pedido',
                                            selectedPayment.table_number !==
                                            null
                                                ? `Mesa ${selectedPayment.table_number}`
                                                : 'Para llevar',
                                        ],
                                        [
                                            'Método de pago',
                                            paymentMethodLabels[
                                                selectedPayment.payment_method
                                            ],
                                        ],
                                        [
                                            'Comprobante',
                                            `${receiptTypeLabels[selectedPayment.receipt_type]} ${selectedPayment.receipt_number ?? 'sin número'}`,
                                        ],
                                        [
                                            'Código de operación',
                                            selectedPayment.operation_code ??
                                                '—',
                                        ],
                                        [
                                            'Cajero',
                                            selectedPayment.cashier_name,
                                        ],
                                        [
                                            'Cliente',
                                            selectedPayment.customer_name ??
                                                '—',
                                        ],
                                        [
                                            'Documento',
                                            selectedPayment.customer_document ??
                                                '—',
                                        ],
                                        [
                                            'Fecha y hora',
                                            format(
                                                new Date(
                                                    selectedPayment.paid_at,
                                                ),
                                                'dd/MM/yyyy HH:mm',
                                            ),
                                        ],
                                    ].map(([label, value]) => (
                                        <div
                                            key={label}
                                            className="rounded-xl border bg-surface-secondary/25 p-3"
                                        >
                                            <p className="text-xs text-muted-foreground">
                                                {label}
                                            </p>
                                            <p className="mt-1 text-sm font-medium break-words">
                                                {value}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {selectedPayment.receipt_print_url && (
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                window.open(
                                                    selectedPayment.receipt_print_url!,
                                                    '_blank',
                                                    'noopener,noreferrer',
                                                )
                                            }
                                        >
                                            Imprimir ticket
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() =>
                                                window.open(
                                                    selectedPayment.receipt_download_url!,
                                                    '_blank',
                                                    'noopener,noreferrer',
                                                )
                                            }
                                        >
                                            Descargar PDF
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="border-t p-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setSelectedPayment(null)}
                                >
                                    Cerrar
                                </Button>
                            </div>
                        </>
                    )}
                </DrawerContent>
            </Drawer>
        </>
    );
}
