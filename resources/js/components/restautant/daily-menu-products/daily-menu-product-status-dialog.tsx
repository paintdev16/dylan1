import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { RestaurantTable } from '@/types/restaurant';
import { Form } from '@inertiajs/react';
import { status } from '@/routes/tables';
import { useState } from 'react';

type Props = {
    table: RestaurantTable;
    status: 'available' | 'out_of_service';
};

export function TableStatusDialog({
    table,
    status: newStatus,
}: Props) {
    const [open, setOpen] = useState(false);

    const isDisabling = newStatus === 'out_of_service';

    const closeDialog = () => {
        // Quitamos el foco antes de cerrar
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        setOpen(false);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={setOpen}
        >
            <DialogTrigger
                render={
                    <Button
                        variant="ghost"
                        size="icon"
                    >
                        {isDisabling ? (
                            <AlertTriangle className="size-4 text-destructive" />
                        ) : (
                            <CheckCircle className="size-4 text-emerald-600" />
                        )}
                    </Button>
                }
            />

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isDisabling
                            ? 'Poner mesa fuera de servicio'
                            : 'Habilitar mesa'}
                    </DialogTitle>

                    <DialogDescription>
                        {isDisabling
                            ? `¿Estás seguro de poner la Mesa ${table.number} fuera de servicio? No podrá utilizarse para nuevas órdenes.`
                            : `¿Deseas habilitar nuevamente la Mesa ${table.number}?`}
                    </DialogDescription>
                </DialogHeader>

                <Form
                    action={status(table.id)}
                    method="patch"
                    className="flex justify-end gap-2"
                    onSuccess={() => {
                        closeDialog();
                    }}
                >
                    <input
                        type="hidden"
                        name="status"
                        value={newStatus}
                    />

                    <Button
                        type="button"
                        variant="outline"
                        onClick={closeDialog}
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="submit"
                        variant={
                            isDisabling
                                ? 'destructive'
                                : 'default'
                        }
                    >
                        {isDisabling
                            ? 'Poner fuera de servicio'
                            : 'Habilitar mesa'}
                    </Button>
                </Form>
            </DialogContent>
        </Dialog>
    );
}