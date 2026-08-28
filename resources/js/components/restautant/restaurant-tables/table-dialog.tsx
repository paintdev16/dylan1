import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Pencil, Plus } from 'lucide-react';
import { Product, RestaurantTable } from '@/types/restaurant';
import { TableForm } from './table-form';
import { store, update } from '@/routes/tables';

type Props = {
    table?: RestaurantTable;
};

export function TableDialog({ table }: Props) {
    const [open, setOpen] = useState(false);

    const isEditing = !!table;

    return (
        <Dialog
            open={open}
            onOpenChange={setOpen}
        >
            <DialogTrigger
                render={
                    isEditing ? (
                        <Button variant="ghost" size="icon">
                            <Pencil className="size-4" />
                        </Button>
                    ) : (
                        <Button>
                            <Plus className="size-4" />
                            Crear producto
                        </Button>
                    )
                }
            />

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditing
                            ? 'Editar producto'
                            : 'Crear producto'}
                    </DialogTitle>
                </DialogHeader>

                <TableForm
                    table={table}
                    action={
                        isEditing
                            ? update(table.id)
                            : store()
                    }
                    method={
                        isEditing
                            ? 'put'
                            : 'post'
                    }
                    submitLabel={
                        isEditing
                            ? 'Actualizar producto'
                            : 'Crear producto'
                    }
                    onSuccess={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}