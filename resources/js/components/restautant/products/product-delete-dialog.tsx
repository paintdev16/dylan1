import { Form } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import type { ReactElement } from 'react';

import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { Product } from '@/types/restaurant';
import { destroy } from '@/routes/products';

type Props = {
    product: Product;
    trigger?: ReactElement;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export function ProductDeleteDialog({
    product,
    trigger,
    open,
    onOpenChange,
}: Props) {
    const isControlled = onOpenChange !== undefined;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            {!isControlled && (
                <AlertDialogTrigger
                    render={
                        trigger ?? (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        )
                    }
                />
            )}

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        ¿Eliminar producto {product.name}?
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. El producto será
                        eliminado permanentemente.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <AlertDialogCancel className="w-full sm:w-auto">
                        Cancelar
                    </AlertDialogCancel>

                    <Form
                        action={destroy(product.id)}
                        method="delete"
                        className="w-full sm:w-auto"
                    >
                        {({ processing }) => (
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={processing}
                                className="w-full sm:w-auto"
                            >
                                {processing ? 'Eliminando...' : 'Eliminar'}
                            </Button>
                        )}
                    </Form>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
