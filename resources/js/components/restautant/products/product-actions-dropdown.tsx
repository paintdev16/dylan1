import { useState } from 'react';
import { Ellipsis, Eye, PackagePlus, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MenuCategory, Product } from '@/types/restaurant';

import { ProductDeleteDialog } from './product-delete-dialog';
import { ProductDetailDialog } from './product-detail-dialog';
import { ProductDialog } from './product-dialog';
import { ProductStockDialog } from './product-stock-dialog';

type DialogName = 'details' | 'edit' | 'stock' | 'delete' | null;

type Props = {
    product: Product;
    category?: MenuCategory;
    categories: MenuCategory[];
};

export function ProductActionsDropdown({
    product,
    category,
    categories,
}: Props) {
    const [activeDialog, setActiveDialog] = useState<DialogName>(null);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Acciones para ${product.name}`}
                        >
                            <Ellipsis className="size-4" />
                        </Button>
                    }
                />

                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onClick={() => setActiveDialog('details')}
                    >
                        <Eye />
                        Detalles
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setActiveDialog('edit')}>
                        <Pencil />
                        Editar
                    </DropdownMenuItem>

                    {category?.name === 'Bebidas' && (
                        <DropdownMenuItem
                            onClick={() => setActiveDialog('stock')}
                        >
                            <PackagePlus />
                            Gestionar stock
                        </DropdownMenuItem>
                    )}

                    {!product.has_daily_menu_products && (
                        <>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setActiveDialog('delete')}
                            >
                                <Trash2 />
                                Eliminar
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <ProductDetailDialog
                product={product}
                category={category}
                open={activeDialog === 'details'}
                onOpenChange={(open) =>
                    setActiveDialog(open ? 'details' : null)
                }
            />

            <ProductDialog
                product={product}
                categories={categories}
                open={activeDialog === 'edit'}
                onOpenChange={(open) => setActiveDialog(open ? 'edit' : null)}
            />

            {category?.name === 'Bebidas' && (
                <ProductStockDialog
                    product={product}
                    open={activeDialog === 'stock'}
                    onOpenChange={(open) =>
                        setActiveDialog(open ? 'stock' : null)
                    }
                />
            )}

            {!product.has_daily_menu_products && (
                <ProductDeleteDialog
                    product={product}
                    open={activeDialog === 'delete'}
                    onOpenChange={(open) =>
                        setActiveDialog(open ? 'delete' : null)
                    }
                />
            )}
        </>
    );
}
