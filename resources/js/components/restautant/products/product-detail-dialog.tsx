import { BadgeDollarSign, ImageOff, Package } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { MenuCategory, Product } from '@/types/restaurant';

type Props = {
    product: Product;
    category?: MenuCategory;
    children?: ReactElement;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export function ProductDetailDialog({
    product,
    category,
    children,
    open,
    onOpenChange,
}: Props) {
    const typeLabel =
        product.type === 'prepared' ? 'Preparado' : 'Venta directa';
    const isActive = product.status === 'active';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {children && <DialogTrigger render={children} />}

            <DialogContent className="max-h-[92vh] w-[95vw] max-w-xl! overflow-y-auto p-6 sm:p-8">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Package className="size-6" />
                        Detalles del producto
                    </DialogTitle>
                </DialogHeader>

                <div className="flex gap-4 rounded-lg border bg-muted/20 p-4">
                    {product.image ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="size-20 shrink-0 rounded-lg border object-cover"
                        />
                    ) : (
                        <div className="flex size-20 shrink-0 items-center justify-center rounded-lg border bg-muted">
                            <ImageOff className="size-7 text-muted-foreground" />
                        </div>
                    )}

                    <div className="min-w-0">
                        <p className="truncate text-lg font-semibold">
                            {product.name}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {category?.name ?? 'Sin categoría'}
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <DetailItem label="Categoría">
                        {category?.name ??
                            product.menu_category?.name ??
                            'Sin categoría'}
                    </DetailItem>

                    {product.menu_subcategory && (
                        <DetailItem label="Subcategoría">
                            {product.menu_subcategory.name}
                        </DetailItem>
                    )}

                    {product.menu_subcategory_type && (
                        <DetailItem label="Tipo de Menú">
                            {product.menu_subcategory_type.name}
                        </DetailItem>
                    )}

                    <DetailItem label="Precio">
                        <span className="flex items-center gap-1 font-medium">
                            <BadgeDollarSign className="size-4 text-emerald-600" />
                            S/ {Number(product.price).toFixed(2)}
                        </span>
                    </DetailItem>

                    <DetailItem label="Tipo">{typeLabel}</DetailItem>

                    <DetailItem label="Presentación">
                        {product.presentation ?? 'No registrada'}
                    </DetailItem>

                    <DetailItem label="Stock actual">
                        {product.product_stock?.quantity ?? 0}
                    </DetailItem>

                    <DetailItem label="Estado">
                        <span
                            className={
                                isActive
                                    ? 'font-medium text-emerald-600 dark:text-emerald-400'
                                    : 'font-medium text-muted-foreground'
                            }
                        >
                            {isActive ? 'Activo' : 'Inactivo'}
                        </span>
                    </DetailItem>

                    <DetailItem label="ID del producto">
                        #{product.id}
                    </DetailItem>
                </div>

                <DetailItem label="Descripción">
                    {product.description ?? 'Sin descripción registrada.'}
                </DetailItem>
            </DialogContent>
        </Dialog>
    );
}

function DetailItem({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <div className="text-sm">{children}</div>
        </div>
    );
}
