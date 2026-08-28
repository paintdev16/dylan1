import { Head, router } from '@inertiajs/react';
import { BadgeDollarSign, CircleHelp, ImageOff } from 'lucide-react';

import { PageHeader } from '@/components/page-header';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { Switch } from '@/components/ui/switch';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

import {
    DailyMenu,
    DailyMenuProduct,
    MenuSubcategory,
    Product,
} from '@/types/restaurant';

import { index, updateStatus } from '@/routes/daily-menu-products';

import { DailyMenuProductDialog } from '@/components/restautant/daily-menu-products/daily-menu-product-dialog';
import { DailyMenuProductDeleteDialog } from '@/components/restautant/daily-menu-products/daily-menu-product-delete-dialog';

type Props = {
    dailyMenuProducts: DailyMenuProduct[];
    products: Product[];
    dailyMenu: DailyMenu;
    menuSubcategories: MenuSubcategory[];
};

export default function Index({
    dailyMenuProducts,
    products,
    dailyMenu,
    menuSubcategories,
}: Props) {
    return (
        <>
            <Head title="Productos del menú del día" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <PageHeader
                        title="Productos del menú del día"
                        description={`Administra los productos disponibles para el ${dailyMenu.formatted_date}.`}
                    />

                    <DailyMenuProductDialog
                        products={products}
                        dailyMenu={dailyMenu}
                        menuSubcategories={menuSubcategories}
                    />
                </div>

                {/* Tabla */}
                {dailyMenuProducts.length > 0 ? (
                    <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                                        <TableHead className="h-12 px-5 font-semibold">
                                            Producto
                                        </TableHead>

                                        <TableHead className="h-12 font-semibold">
                                            Subcategoría
                                        </TableHead>

                                        <TableHead className="h-12 font-semibold">
                                            Precio
                                        </TableHead>

                                        <TableHead className="h-12 font-semibold">
                                            Disponibles
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
                                    {dailyMenuProducts.map((item) => {
                                        const product = item.product;
                                        const subcategory =
                                            product?.menu_subcategory;

                                        const isActive = item.active;

                                        return (
                                            <TableRow
                                                key={item.id}
                                                className="group transition-colors hover:bg-muted/30"
                                            >
                                                {/* Producto */}
                                                <TableCell className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {/* Columna 1: Imagen */}
                                                        {product?.image ? (
                                                            <img
                                                                src={
                                                                    product.image
                                                                }
                                                                alt={
                                                                    product.name
                                                                }
                                                                className="size-12 rounded-lg border object-cover shadow-sm"
                                                            />
                                                        ) : (
                                                            <div className="flex size-12 items-center justify-center rounded-lg border bg-muted">
                                                                <ImageOff className="size-5 text-muted-foreground" />
                                                            </div>
                                                        )}

                                                        {/* Columna 2: Nombre */}
                                                        {product?.description ? (
                                                            <Tooltip>
                                                                <TooltipTrigger
                                                                    render={
                                                                        // cursor-help
                                                                        <div className="flex min-w-0  items-center gap-1.5 cursor-default">
                                                                            <div className="truncate font-semibold">
                                                                                {
                                                                                    product.name
                                                                                }
                                                                            </div>
                                                                            <CircleHelp className="size-3.5 shrink-0 text-muted-foreground" />
                                                                        </div>
                                                                    }
                                                                />
                                                                <TooltipContent>
                                                                    {
                                                                        product.description
                                                                    }
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        ) : (
                                                            <div className="truncate font-semibold">
                                                                {product?.name ??
                                                                    'Producto eliminado'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* Subcategoría */}
                                                <TableCell>
                                                    <span className="text-sm font-medium">
                                                        {subcategory?.name ??
                                                            'Sin subcategoría'}
                                                    </span>
                                                </TableCell>

                                                {/* Precio */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                            <BadgeDollarSign className="size-4" />
                                                        </div>

                                                        <span className="font-semibold">
                                                            S/{' '}
                                                            {Number(
                                                                item.price,
                                                            ).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* Cantidad disponible */}
                                                <TableCell>
                                                    <span
                                                        className={
                                                            item.quantity_available >
                                                            0
                                                                ? 'text-sm font-medium'
                                                                : 'text-sm font-medium text-red-500'
                                                        }
                                                    >
                                                        {
                                                            item.quantity_available
                                                        }
                                                    </span>
                                                </TableCell>

                                                {/* Estado */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            checked={isActive}
                                                            onCheckedChange={(
                                                                checked,
                                                            ) => {
                                                                router.patch(
                                                                    updateStatus(
                                                                        item,
                                                                    ),
                                                                    {
                                                                        active: checked,
                                                                    },
                                                                    {
                                                                        preserveScroll: true,
                                                                    },
                                                                );
                                                            }}
                                                            aria-label={`Cambiar estado de ${
                                                                product?.name ??
                                                                'producto'
                                                            }`}
                                                        />

                                                        <span
                                                            className={
                                                                isActive
                                                                    ? 'text-sm font-medium text-emerald-600 dark:text-emerald-400'
                                                                    : 'text-sm font-medium text-muted-foreground'
                                                            }
                                                        >
                                                            {isActive
                                                                ? 'Activo'
                                                                : 'Inactivo'}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* Acciones */}
                                                <TableCell className="pr-5">
                                                    <div className="flex justify-end gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                                                        <DailyMenuProductDialog
                                                            dailyMenuProduct={
                                                                item
                                                            }
                                                            products={products}
                                                            dailyMenu={
                                                                dailyMenu
                                                            }
                                                            menuSubcategories={
                                                                menuSubcategories
                                                            }
                                                        />
                                                        <DailyMenuProductDeleteDialog
                                                            dailyMenuProduct={
                                                                item
                                                            }
                                                        />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                ) : (
                    <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/10 text-center">
                        <div className="mb-2 rounded-full bg-muted p-3">
                            <BadgeDollarSign className="size-5 text-muted-foreground" />
                        </div>

                        <p className="font-medium">
                            No hay productos registrados
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Comienza agregando un producto al menú del día.
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
            title: 'Productos del menú del día',
            href: index(),
        },
    ],
};
