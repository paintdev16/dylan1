import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { BadgeDollarSign, ImageOff } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { ProductActionsDropdown } from '@/components/restautant/products/product-actions-dropdown';
import { ProductDialog } from '@/components/restautant/products/product-dialog';
import { Button } from '@/components/ui/button';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { index } from '@/routes/tables';

import { MenuCategory, Product } from '@/types/restaurant';
import { Switch } from '@/components/ui/switch';

type Props = {
    products: Product[];
    categories: MenuCategory[];
};

type CategoryFilter = 'all' | 'beverages' | 'food';

export default function Index({ products, categories }: Props) {
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

    const filteredProducts = products.filter((product) => {
        if (categoryFilter === 'all') {
            return true;
        }

        return (
            categories.find(
                (category) => category.id === product.menu_category_id,
            )?.code === categoryFilter
        );
    });

    return (
        <>
            <Head title="Productos" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <PageHeader
                        title="Productos"
                        description="Administra y consulta los productos del restaurante."
                    />

                    <ProductDialog categories={categories} />
                </div>

                <div
                    className="flex flex-wrap gap-2"
                    aria-label="Filtrar productos por categoría"
                >
                    {(
                        [
                            ['all', 'Todos'],
                            ['beverages', 'Bebidas'],
                            ['food', 'Comidas'],
                        ] as const
                    ).map(([value, label]) => (
                        <Button
                            key={value}
                            type="button"
                            size="sm"
                            variant={
                                categoryFilter === value ? 'default' : 'outline'
                            }
                            aria-pressed={categoryFilter === value}
                            onClick={() => setCategoryFilter(value)}
                        >
                            {label}
                        </Button>
                    ))}
                </div>

                {/* Tabla */}
                {products.length > 0 ? (
                    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-primary-soft/60 hover:bg-primary-soft/60">
                                        <TableHead className="h-12 px-5 font-semibold">
                                            Producto
                                        </TableHead>

                                        <TableHead className="h-12 font-semibold">
                                            Categoría
                                        </TableHead>

                                        <TableHead className="h-12 font-semibold">
                                            Precio
                                        </TableHead>

                                        <TableHead className="h-12 font-semibold">
                                            Stock
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
                                    {filteredProducts.map((product) => {
                                        const category = categories.find(
                                            (category) =>
                                                category.id ===
                                                product.menu_category_id,
                                        );

                                        const isActive =
                                            product.status === 'active';

                                        const stockQuantity =
                                            category?.code === 'food'
                                                ? (product.daily_menu_quantity ??
                                                  0)
                                                : (product.product_stock
                                                      ?.quantity ?? 0);

                                        return (
                                            <TableRow
                                                key={product.id}
                                                className="group transition-colors hover:bg-muted/30"
                                            >
                                                {/* Producto */}
                                                <TableCell className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {/* Imagen */}
                                                        {product.image ? (
                                                            <img
                                                                src={
                                                                    product.image
                                                                }
                                                                alt={
                                                                    product.name
                                                                }
                                                                className="size-12 shrink-0 rounded-lg border object-cover shadow-sm"
                                                            />
                                                        ) : (
                                                            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary-soft">
                                                                <ImageOff className="size-5 text-primary" />
                                                            </div>
                                                        )}

                                                        {/* Información del producto */}
                                                        <div className="min-w-0">
                                                            <div className="font-semibold">
                                                                {product.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Categoría */}
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">
                                                            {category?.name ??
                                                                product
                                                                    .menu_category
                                                                    ?.name ??
                                                                'Sin categoría'}
                                                        </span>
                                                        {product.menu_subcategory && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {
                                                                    product
                                                                        .menu_subcategory
                                                                        .name
                                                                }
                                                                {product.menu_subcategory_type
                                                                    ? ` • ${product.menu_subcategory_type.name}`
                                                                    : ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* Precio */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex size-8 items-center justify-center rounded-lg bg-success-soft text-success">
                                                            <BadgeDollarSign className="size-4" />
                                                        </div>

                                                        <span className="font-semibold">
                                                            S/{' '}
                                                            {Number(
                                                                product.price,
                                                            ).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <span className="text-sm font-semibold">
                                                        {stockQuantity}
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
                                                                    `/products/${product.id}/status`,
                                                                    {
                                                                        status: checked
                                                                            ? 'active'
                                                                            : 'inactive',
                                                                    },
                                                                    {
                                                                        preserveScroll: true,
                                                                    },
                                                                );
                                                            }}
                                                            aria-label={`Cambiar estado de ${product.name}`}
                                                        />

                                                        <span
                                                            className={
                                                                isActive
                                                                    ? 'text-sm font-medium text-success'
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
                                                    <div className="flex justify-end">
                                                        <ProductActionsDropdown
                                                            product={product}
                                                            category={category}
                                                            categories={
                                                                categories
                                                            }
                                                        />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}

                                    {filteredProducts.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="h-24 text-center text-muted-foreground"
                                            >
                                                No hay productos en esta
                                                categoría.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                ) : (
                    <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-primary/25 bg-primary-soft/40 text-center">
                        <div className="mb-2 rounded-full bg-primary-soft p-3">
                            <BadgeDollarSign className="size-5 text-primary" />
                        </div>

                        <p className="font-medium">
                            No hay productos registrados
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Comienza agregando un nuevo producto.
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
            title: 'Productos',
            href: index(),
        },
    ],
};
