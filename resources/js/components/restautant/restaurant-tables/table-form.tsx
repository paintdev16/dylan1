import { Form } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Product, RestaurantTable } from '@/types/restaurant';
import { store, update } from '@/routes/tables';

type Props = {
    table?: RestaurantTable;
    action: ReturnType<typeof store> | ReturnType<typeof update>;
    method: 'post' | 'put';
    submitLabel: string;
    onSuccess: () => void;
};

export function TableForm({
    table,
    action,
    method,
    submitLabel,
    onSuccess,
}: Props) {
    return (
        <Form
            action={action}
            method={method}
            className="space-y-6"
            onSuccess={onSuccess}
        >
            {({ errors, processing }) => (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="number">Número de mesa</Label>

                        <Input
                            id="number"
                            name="number"
                            type="number"
                            min="1"
                            defaultValue={table?.id ?? ''}
                            placeholder="Ej. 10"
                        />

                        {errors.number && (
                            <p className="text-sm text-destructive">
                                {errors.number}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="capacity">Capacidad</Label>

                        <Input
                            id="capacity"
                            name="capacity"
                            type="number"
                            min="1"
                            defaultValue={table?.capacity ?? 4}
                            placeholder="Ej. 4"
                        />

                        {errors.capacity && (
                            <p className="text-sm text-destructive">
                                {errors.capacity}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : submitLabel}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
