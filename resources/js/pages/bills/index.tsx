import { Head, Link } from '@inertiajs/react';
import { Banknote, ReceiptText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import { PageHeader } from '@/components/page-header';
import { buttonVariants } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { index as cashRegisterIndex } from '@/routes/cash-register';
import { Bill } from '@/types/restaurant';

type Props = { bills: Bill[] };

const money = (value: number) => `S/. ${Number(value).toFixed(2)}`;

export default function Index({ bills }: Props) {
    return (
        <>
            <Head title="Cuentas" />
            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <PageHeader
                        title="Cuentas"
                        description="Se crean con la primera comanda y se cierran al completar el cobro en Caja."
                    />
                    <Link
                        href={cashRegisterIndex()}
                        className={buttonVariants()}
                    >
                        <Banknote className="size-4" /> Ir a Caja
                    </Link>
                </div>
                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-cash-soft/70 hover:bg-cash-soft/70">
                                <TableHead>Cuenta</TableHead>
                                <TableHead>Mesa</TableHead>
                                <TableHead>Mozo</TableHead>
                                <TableHead className="text-right">
                                    Total
                                </TableHead>
                                <TableHead className="text-right">
                                    Pagado
                                </TableHead>
                                <TableHead className="text-right">
                                    Saldo
                                </TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bills.map((bill) => (
                                <TableRow key={bill.id}>
                                    <TableCell className="font-medium">
                                        <span className="flex items-center gap-2">
                                            <ReceiptText className="size-4 text-muted-foreground" />
                                            #{bill.id}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {bill.restaurant_table
                                            ? `Mesa ${bill.restaurant_table.number}`
                                            : 'Para llevar'}
                                    </TableCell>
                                    <TableCell>
                                        {bill.opening_waiter?.name ??
                                            'Sin asignar'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {money(bill.total_amount)}
                                    </TableCell>
                                    <TableCell className="text-right text-success">
                                        {money(bill.paid_amount)}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                        {money(bill.balance)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={
                                                bill.status === 'open'
                                                    ? 'border-card-warning-border bg-warning-soft text-warning'
                                                    : 'border-card-success-border bg-success-soft text-success'
                                            }
                                        >
                                            {bill.status === 'open'
                                                ? 'Abierta'
                                                : 'Cerrada'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {bills.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No hay cuentas registradas.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}
