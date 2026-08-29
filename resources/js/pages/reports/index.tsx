import { Form, Head } from '@inertiajs/react';
import {
    BarChart3,
    Banknote,
    CreditCard,
    ReceiptText,
    Smartphone,
} from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index } from '@/routes/reports';

type Props = {
    filters: { from: string; to: string };
    summary: {
        total: number;
        transactions: number;
        cash: number;
        card: number;
        digital: number;
    };
    topProducts: Array<{
        id: number;
        name: string;
        quantity_sold: number;
        sales_total: number;
    }>;
};

const money = (value: number) => `S/. ${Number(value).toFixed(2)}`;

export default function ReportsIndex({ filters, summary, topProducts }: Props) {
    const cards = [
        ['Ventas totales', money(summary.total), BarChart3],
        ['Efectivo', money(summary.cash), Banknote],
        ['Tarjeta', money(summary.card), CreditCard],
        ['Yape / Plin', money(summary.digital), Smartphone],
    ] as const;

    return (
        <>
            <Head title="Reportes" />
            <div className="space-y-6 p-6">
                <PageHeader
                    title="Reportes"
                    description="Resumen de ventas y productos para el periodo seleccionado."
                />
                <Form
                    {...index.form()}
                    className="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                >
                    <div className="space-y-2">
                        <Label htmlFor="from">Desde</Label>
                        <Input
                            id="from"
                            name="from"
                            type="date"
                            defaultValue={filters.from}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="to">Hasta</Label>
                        <Input
                            id="to"
                            name="to"
                            type="date"
                            defaultValue={filters.to}
                        />
                    </div>
                    <Button type="submit">Aplicar</Button>
                </Form>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map(([label, value, Icon]) => (
                        <div
                            key={label}
                            className="rounded-xl border bg-card p-4"
                        >
                            <Icon className="size-5 text-primary" />
                            <p className="mt-3 text-sm text-muted-foreground">
                                {label}
                            </p>
                            <p className="text-2xl font-bold">{value}</p>
                        </div>
                    ))}
                </div>
                <div className="rounded-xl border bg-card p-4">
                    <div className="mb-4 flex items-center gap-2">
                        <ReceiptText className="size-5" />
                        <h2 className="font-semibold">
                            Productos más vendidos
                        </h2>
                        <span className="text-sm text-muted-foreground">
                            ({summary.transactions} cobros)
                        </span>
                    </div>
                    <div className="space-y-3">
                        {topProducts.map((product) => (
                            <div
                                key={product.id}
                                className="flex items-center justify-between gap-4 border-b pb-3"
                            >
                                <span>{product.name}</span>
                                <span className="text-sm font-medium">
                                    {product.quantity_sold} uds. ·{' '}
                                    {money(product.sales_total)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
