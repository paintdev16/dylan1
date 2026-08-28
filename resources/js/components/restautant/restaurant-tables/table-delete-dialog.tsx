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

import { RestaurantTable } from '@/types/restaurant';
import { destroy } from '@/routes/tables';

type Props = {
    table: RestaurantTable;
};

export function TableDeleteDialog({ table }: Props) {
    return (
        <AlertDialog>
            <AlertDialogTrigger
                render={
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                    >
                        <Trash2 className="size-4" />
                    </Button>
                }
            />

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        ¿Eliminar mesa {table.number}?
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. La mesa será eliminada
                        permanentemente.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <AlertDialogCancel className="w-full sm:w-auto">
                        Cancelar
                    </AlertDialogCancel>

                    <Form
                        action={destroy(table.id)}
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
