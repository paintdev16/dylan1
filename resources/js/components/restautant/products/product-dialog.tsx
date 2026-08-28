import { useState, type ReactElement } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Pencil, Plus } from 'lucide-react';

import { MenuCategory, Product } from '@/types/restaurant';
import { store, update } from '@/routes/products';
import { ProductForm } from './product-form';

type Props = {
    product?: Product;
    categories: MenuCategory[];
    trigger?: ReactElement;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export function ProductDialog({
    product,
    categories,
    trigger,
    open,
    onOpenChange,
}: Props) {
    const [internalOpen, setInternalOpen] = useState(false);

    const isControlled = onOpenChange !== undefined;
    const dialogOpen = isControlled ? open : internalOpen;
    const handleOpenChange = onOpenChange ?? setInternalOpen;

    const isEditing = !!product;

    return (
        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
            {!isControlled && (
                <DialogTrigger
                    render={
                        isEditing ? (
                            (trigger ?? (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-primary hover:bg-primary/10 hover:text-primary"
                                >
                                    <Pencil className="size-4" />
                                </Button>
                            ))
                        ) : (
                            <Button>
                                <Plus className="size-4" />
                                Crear producto
                            </Button>
                        )
                    }
                />
            )}

            <DialogContent className="max-h-[92vh] w-[95vw] max-w-xl! overflow-y-auto p-6 sm:p-8">
                <DialogHeader className="border-b pb-4">
                    <DialogTitle className="text-xl">
                        {isEditing ? 'Editar producto' : 'Crear producto'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Actualiza la información comercial y la disponibilidad del producto.'
                            : 'Completa los datos principales para registrar un nuevo producto.'}
                    </DialogDescription>
                </DialogHeader>

                <ProductForm
                    product={product}
                    categories={categories}
                    action={isEditing ? update(product.id) : store()}
                    method={isEditing ? 'put' : 'post'}
                    submitLabel={
                        isEditing ? 'Actualizar producto' : 'Crear producto'
                    }
                    onSuccess={() => handleOpenChange(false)}
                    onCancel={() => handleOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
