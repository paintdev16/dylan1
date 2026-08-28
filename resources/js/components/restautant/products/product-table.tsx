import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { BadgeDollarSign } from 'lucide-react';

import { MenuCategory, Product } from '@/types/restaurant';

import { ProductDeleteDialog } from './product-delete-dialog';
import { ProductDialog } from './product-dialog';

type Props = {
    product: Product;
    categories: MenuCategory[];
};

export function ProductTable({ product, categories }: Props) {
    const category = categories.find(
        (category) => category.id === product.menu_category_id,
    );

    const typeLabel =
        product.type === 'prepared' ? 'Preparado' : 'Venta directa';

    const isActive = product.status === 'activo';

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Presentación</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                <TableRow>
                    {/* Producto */}
                    <TableCell>
                        <div className="font-medium">{product.name}</div>

                        {product.description && (
                            <div className="max-w-md truncate text-sm text-muted-foreground">
                                {product.description}
                            </div>
                        )}
                    </TableCell>

                    {/* Categoría */}
                    <TableCell>{category?.name ?? 'Sin categoría'}</TableCell>

                    {/* Tipo */}
                    <TableCell>
                        <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium">
                            {typeLabel}
                        </span>
                    </TableCell>

                    {/* Presentación */}
                    <TableCell>{product.presentation ?? '—'}</TableCell>

                    {/* Precio */}
                    <TableCell>
                        <div className="flex items-center gap-2 font-medium">
                            <BadgeDollarSign className="size-4 text-muted-foreground" />

                            <span>S/ {Number(product.price).toFixed(2)}</span>
                        </div>
                    </TableCell>

                    {/* Estado */}
                    <TableCell>
                        {isActive ? (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                Activo
                            </span>
                        ) : (
                            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                Inactivo
                            </span>
                        )}
                    </TableCell>

                    {/* Acciones */}
                    <TableCell>
                        <div className="flex justify-end gap-1">
                            <ProductDialog
                                product={product}
                                categories={categories}
                            />

                            <ProductDeleteDialog product={product} />
                        </div>
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    );
}
