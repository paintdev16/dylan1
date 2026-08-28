import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    BadgeDollarSign,
    CalendarDays,
    CircleHelp,
    History,
    ImageOff,
    Sparkles,
} from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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

type PastMenuSummary = {
    id: number;
    date: string;
    formatted_date: string;
    active: boolean;
    products_count: number;
    products: Array<{
        id: number;
        product_name: string;
        subcategory_name?: string;
        type_name?: string;
        price: number | string;
        quantity_available: number;
        active: boolean;
    }>;
};

type Props = {
    dailyMenuProducts: DailyMenuProduct[];
    products: Product[];
    dailyMenu: DailyMenu;
    menuSubcategories: MenuSubcategory[];
    menuModalities?: MenuModality[];
    pastMenus?: PastMenuSummary[];
};

export default function Index({
    dailyMenuProducts,
    products,
    dailyMenu,
    menuSubcategories,
    menuModalities = [],
    pastMenus = [],
}: Props) {
    const [showHistory, setShowHistory] = useState(false);
    const [isMenuUpdating, setIsMenuUpdating] = useState(false);
    const [editingModalityId, setEditingModalityId] = useState<number | null>(null);
    const [modalityPrice, setModalityPrice] = useState<string>('');

    const isDailyMenuActive = dailyMenu.active;

    const handleMenuStatusToggle = (checked: boolean) => {
        setIsMenuUpdating(true);
        router.patch(
            `/daily-menus/${dailyMenu.id}/status`,
            { active: checked },
            {
                preserveScroll: true,
                onFinish: () => setIsMenuUpdating(false),
            },
        );
    };

    const handleModalityToggle = (modality: MenuModality, checked: boolean) => {
        router.put(
            `/daily-menu-modalities/${modality.id}`,
            {
                price: modality.price,
                description: modality.description,
                active: checked,
            },
            {
                preserveScroll: true,
            },
        );
    };

    const handleSaveModalityPrice = (modality: MenuModality) => {
        const numPrice = parseFloat(modalityPrice);
        if (isNaN(numPrice) || numPrice < 0) return;

        router.put(
            `/daily-menu-modalities/${modality.id}`,
            {
                price: numPrice,
                description: modality.description,
                active: modality.active,
            },
            {
                preserveScroll: true,
                onSuccess: () => setEditingModalityId(null),
            },
        );
    };

    return (
        <>
            <Head title="Menú del Día" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <PageHeader
                        title="Menú Diario"
                        description={`Configuración operativa del menú para hoy (${dailyMenu.formatted_date}).`}
                    />

                    <div className="flex flex-wrap items-center gap-2">
                        {pastMenus.length > 0 && (
                            <Button
                                type="button"
                                variant={showHistory ? 'default' : 'outline'}
                                onClick={() => setShowHistory(!showHistory)}
                                className="gap-2"
                            >
                                <History className="size-4" />
                                {showHistory ? 'Ver Menú de Hoy' : 'Historial de Menús'}
                            </Button>
                        )}

                        {!showHistory && (
                            <DailyMenuProductDialog
                                products={products}
                                dailyMenu={dailyMenu}
                                menuSubcategories={menuSubcategories}
                            />
                        )}
                    </div>
                </div>

                {!showHistory ? (
                    <>
                        {/* Estado del Menú Completo */}
                        <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`flex size-10 items-center justify-center rounded-lg ${
                                        isDailyMenuActive
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                    }`}
                                >
                                    <Sparkles className="size-5" />
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold">
                                            Estado del Menú Diario
                                        </h3>
                                        <span
                                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                isDailyMenuActive
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                            }`}
                                        >
                                            {isDailyMenuActive
                                                ? 'Publicado y Activo'
                                                : 'Borrador'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {isDailyMenuActive
                                            ? 'El menú está activo. Los mozos pueden seleccionar sus productos en las mesas.'
                                            : 'El menú está en borrador. Configura los productos y actívalo cuando esté listo.'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 self-end sm:self-center">
                                <span className="text-sm font-medium">
                                    {isDailyMenuActive
                                        ? 'Menú Publicado'
                                        : 'Publicar Menú'}
                                </span>
                                <Switch
                                    checked={isDailyMenuActive}
                                    disabled={isMenuUpdating}
                                    onCheckedChange={handleMenuStatusToggle}
                                    aria-label="Publicar o guardar en borrador el menú del día"
                                />
                            </div>
                        </div>

                        {/* Modalidades del Menú Económico */}
                        {menuModalities.length > 0 && (
                            <div className="rounded-xl border bg-card p-4 shadow-sm">
                                <h3 className="mb-3 text-base font-semibold">
                                    Modalidades del Menú Económico (Hoy)
                                </h3>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    {menuModalities.map((modality) => (
                                        <div
                                            key={modality.id}
                                            className={`flex flex-col justify-between rounded-lg border p-3.5 transition-colors ${
                                                modality.active
                                                    ? 'bg-background'
                                                    : 'bg-muted/30 opacity-70'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-semibold">
                                                        {modality.name}
                                                    </span>
                                                    <Switch
                                                        checked={modality.active}
                                                        onCheckedChange={(checked) =>
                                                            handleModalityToggle(modality, checked)
                                                        }
                                                        aria-label={`Activar modalidad ${modality.name}`}
                                                    />
                                                </div>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {modality.description}
                                                </p>
                                            </div>

                                            <div className="mt-3 flex items-center justify-between border-t pt-2">
                                                <span className="text-xs text-muted-foreground">
                                                    Precio de venta:
                                                </span>
                                                {editingModalityId === modality.id ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-semibold">S/</span>
                                                        <input
                                                            type="number"
                                                            step="0.5"
                                                            value={modalityPrice}
                                                            onChange={(e) => setModalityPrice(e.target.value)}
                                                            className="w-16 rounded border px-1.5 py-0.5 text-xs font-semibold"
                                                            autoFocus
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            className="h-6 px-2 text-xs"
                                                            onClick={() => handleSaveModalityPrice(modality)}
                                                        >
                                                            OK
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-6 px-1.5 text-xs"
                                                            onClick={() => setEditingModalityId(null)}
                                                        >
                                                            X
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                            S/ {Number(modality.price).toFixed(2)}
                                                        </span>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-6 px-1.5 text-xs"
                                                            onClick={() => {
                                                                setEditingModalityId(modality.id);
                                                                setModalityPrice(String(modality.price));
                                                            }}
                                                        >
                                                            Editar
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tabla de Productos de Hoy */}
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
                                                    Clasificación
                                                </TableHead>

                                                <TableHead className="h-12 font-semibold">
                                                    Precio del día
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
                                                const type =
                                                    product?.menu_subcategory_type;

                                                const isActive = item.active;

                                                return (
                                                    <TableRow
                                                        key={item.id}
                                                        className="group transition-colors hover:bg-muted/30"
                                                    >
                                                        {/* Producto */}
                                                        <TableCell className="px-5 py-4">
                                                            <div className="flex items-center gap-3">
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

                                                                {product?.description ? (
                                                                    <Tooltip>
                                                                        <TooltipTrigger
                                                                            render={
                                                                                <div className="flex min-w-0 cursor-default items-center gap-1.5">
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
                                                                            'Producto'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>

                                                        {/* Clasificación */}
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium">
                                                                    {subcategory?.name ??
                                                                        'Sin subcategoría'}
                                                                </span>
                                                                {type && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        Tipo: {type.name}
                                                                    </span>
                                                                )}
                                                            </div>
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
                                                                        : 'text-sm font-medium text-destructive'
                                                                }
                                                            >
                                                                {
                                                                    item.quantity_available
                                                                }{' '}
                                                                porciones
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
                                    No hay productos registrados para hoy
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Comienza agregando los platos del Menú Económico y Platos Especiales del día.
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    /* Historial de Menús Anteriores */
                    <div className="space-y-4">
                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
                            Los menús de fechas anteriores se conservan como historial inmutable para fines de auditoría y reportes. No pueden ser modificados.
                        </div>

                        <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                                        <TableHead className="h-12 px-5 font-semibold">
                                            Fecha
                                        </TableHead>
                                        <TableHead className="h-12 font-semibold">
                                            Platos configurados
                                        </TableHead>
                                        <TableHead className="h-12 font-semibold">
                                            Detalle de productos
                                        </TableHead>
                                        <TableHead className="h-12 pr-5 text-right font-semibold">
                                            Condición
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pastMenus.map((pastMenu) => (
                                        <TableRow key={pastMenu.id}>
                                            <TableCell className="px-5 py-4 font-semibold">
                                                <div className="flex items-center gap-2">
                                                    <CalendarDays className="size-4 text-muted-foreground" />
                                                    {pastMenu.formatted_date}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {pastMenu.products_count} platos
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {pastMenu.products.map((p) => (
                                                        <span
                                                            key={p.id}
                                                            className="rounded-md border bg-muted/40 px-2 py-0.5 text-xs font-medium"
                                                        >
                                                            {p.product_name} (S/ {Number(p.price).toFixed(2)})
                                                        </span>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="pr-5 text-right">
                                                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                                    Historial (Cerrado)
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Menú Diario',
            href: index(),
        },
    ],
};
