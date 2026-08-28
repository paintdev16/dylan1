import { Form } from '@inertiajs/react';
import { UtensilsCrossed, Users } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RestaurantTable } from '@/types/restaurant';

type Props = {
    table: RestaurantTable;
};

export function TableOpenSessionDialog({ table }: Props) {
    const [open, setOpen] = useState(false);
    const [customerCount, setCustomerCount] = useState<number>(2);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                    <UtensilsCrossed className="size-4" />
                    Abrir Mesa
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UtensilsCrossed className="size-5 text-emerald-600" />
                        Abrir Atención en Mesa #{table.number}
                    </DialogTitle>
                    <DialogDescription>
                        Inicia una nueva sesión de atención y apertura la cuenta de la mesa en el sistema.
                    </DialogDescription>
                </DialogHeader>

                <Form
                    action={`/tables/${table.id}/open-session`}
                    method="post"
                    className="space-y-4 pt-2"
                    onSuccess={() => setOpen(false)}
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="rounded-lg border bg-muted/30 p-3 space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Número de Mesa:</span>
                                    <span className="font-semibold text-foreground">Mesa #{table.number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Capacidad Máxima:</span>
                                    <span className="font-semibold text-foreground">{table.capacity} personas</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="customer_count" className="flex items-center gap-1.5">
                                    <Users className="size-4 text-muted-foreground" />
                                    Cantidad de Comensales
                                </Label>
                                <Input
                                    id="customer_count"
                                    name="customer_count"
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={customerCount}
                                    onChange={(e) => setCustomerCount(Number(e.target.value))}
                                    required
                                    autoFocus
                                />
                                {errors.customer_count && (
                                    <p className="text-xs text-destructive">{errors.customer_count}</p>
                                )}
                                {errors.table && (
                                    <p className="text-xs text-destructive">{errors.table}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                    disabled={processing || customerCount < 1}
                                >
                                    {processing ? 'Abriendo mesa...' : 'Confirmar y Abrir Mesa'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
