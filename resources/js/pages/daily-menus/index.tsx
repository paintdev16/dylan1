import { Head } from '@inertiajs/react';
import { CalendarDays, Package } from 'lucide-react';

import { PageHeader } from '@/components/page-header';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { Button } from '@/components/ui/button';

import { DailyMenu } from '@/types/restaurant';

import { DailyMenuDialog } from '@/components/restautant/daily-menus/daily-menu-dialog';
import { DailyMenuDeleteDialog } from '@/components/restautant/daily-menus/daily-menu-delete-dialog';
import { CategoryStatusBadge } from '@/components/restautant/daily-menus/daily-menu-status-badge';
import { DetailDailyMenuProductsDialog } from '@/components/restautant/daily-menus/detail-daily-menu-product-dialog';

import { index } from '@/routes/daily-menus';

type Props = {
    dailyMenus: DailyMenu[];
};

export default function Index({ dailyMenus }: Props) {
    return (
        <>
            <Head title="Menús del día" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <PageHeader
                        title="Menús del día"
                        description="Administra los menús disponibles para cada fecha."
                    />

                    <DailyMenuDialog />
                </div>

                {/* Tabla */}
                {dailyMenus.length > 0 ? (
                    <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                                        <TableHead className="h-12 px-5 font-semibold">
                                            Fecha
                                        </TableHead>

                                        <TableHead className="h-12 font-semibold">
                                            Productos
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
                                    {dailyMenus.map((dailyMenu) => (
                                        <TableRow
                                            key={dailyMenu.id}
                                            className="group transition-colors hover:bg-muted/30"
                                        >
                                            {/* Fecha */}
                                            <TableCell className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                        <CalendarDays className="size-5 text-muted-foreground" />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="font-semibold">
                                                            {
                                                                dailyMenu.formatted_date
                                                            }
                                                        </p>

                                                        <p className="text-sm text-muted-foreground">
                                                            Menú del día
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Productos */}
                                            <TableCell>
                                                {(dailyMenu.products?.length ??
                                                    0) > 0 ? (
                                                    <DetailDailyMenuProductsDialog
                                                        dailyMenu={dailyMenu}
                                                    >
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="group h-auto gap-3 rounded-lg px-3 py-2 transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                                                        >
                                                            <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                                                <Package className="size-4" />
                                                            </div>

                                                            <div className="flex flex-col items-start">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="font-semibold">
                                                                        {dailyMenu
                                                                            .products
                                                                            ?.length ??
                                                                            0}
                                                                    </span>

                                                                    <span className="text-sm font-medium">
                                                                        {(dailyMenu
                                                                            .products
                                                                            ?.length ??
                                                                            0) ===
                                                                        1
                                                                            ? 'producto'
                                                                            : 'productos'}
                                                                    </span>
                                                                </div>

                                                                <span className="text-xs text-muted-foreground transition-colors group-hover:text-primary/70">
                                                                    Ver detalles
                                                                </span>
                                                            </div>
                                                        </Button>
                                                    </DetailDailyMenuProductsDialog>
                                                ) : (
                                                    <div className="flex items-center gap-2 px-2 py-1.5 text-muted-foreground">
                                                        <div className="flex size-9 items-center justify-center rounded-md bg-muted">
                                                            <Package className="size-4" />
                                                        </div>

                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium">
                                                                0 productos
                                                            </span>

                                                            <span className="text-xs">
                                                                Sin productos
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </TableCell>

                                            {/* Estado */}
                                            <TableCell>
                                                <CategoryStatusBadge
                                                    active={dailyMenu.active}
                                                />
                                            </TableCell>

                                            {/* Acciones */}
                                            <TableCell className="pr-5">
                                                <div className="flex justify-end gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                                                    <DailyMenuDialog
                                                        dailyMenu={dailyMenu}
                                                    />

                                                    <DailyMenuDeleteDialog
                                                        dailyMenu={dailyMenu}
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                ) : (
                    <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/10 text-center">
                        <div className="mb-3 rounded-full bg-muted p-3">
                            <CalendarDays className="size-5 text-muted-foreground" />
                        </div>

                        <p className="font-medium">No hay menús registrados</p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Comienza creando un menú para una fecha.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Menús del día',
            href: index(),
        },
    ],
};
