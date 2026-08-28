import { Form } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';

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

import { DailyMenuProduct } from '@/types/restaurant';

import { destroy } from '@/routes/daily-menu-products';

type Props = {
    dailyMenuProduct: DailyMenuProduct;
};

export function DailyMenuProductDeleteDialog({ dailyMenuProduct }: Props) {
    const productName = dailyMenuProduct.product?.name ?? 'este producto';

    return (
        <AlertDialog>
            <AlertDialogTrigger
                render={
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                        <Trash2 className="size-4" />
                    </Button>
                }
            />

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        ¿Eliminar producto del menú?
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        ¿Estás seguro de que deseas eliminar{' '}
                        <strong>{productName}</strong> del menú del día? Esta
                        acción no se puede deshacer.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <AlertDialogCancel className="w-full sm:w-auto">
                        Cancelar
                    </AlertDialogCancel>

                    <Form
                        action={destroy(dailyMenuProduct.id)}
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
