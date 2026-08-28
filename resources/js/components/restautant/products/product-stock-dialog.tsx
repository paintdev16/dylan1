import { Form } from '@inertiajs/react';
import { useState, type ReactElement } from 'react';
import { PackagePlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Product } from '@/types/restaurant';
import { add, adjust } from '@/routes/products/stock';

type MovementType = 'add' | 'adjust';

type Props = {
    product: Product;
    trigger?: ReactElement;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

const movementLabels: Record<MovementType, string> = {
    add: 'Entrada',
    adjust: 'Cantidad disponible final',
};

export function ProductStockDialog({
    product,
    trigger,
    open,
    onOpenChange,
}: Props) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [movementType, setMovementType] = useState<MovementType>('add');

    const isControlled = onOpenChange !== undefined;
    const dialogOpen = isControlled ? open : internalOpen;
    const handleOpenChange = onOpenChange ?? setInternalOpen;

    const action = {
        add: add(product),
        adjust: adjust(product),
    }[movementType];

    const isAdjustment = movementType === 'adjust';

    return (
        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
            {!isControlled && (
                <DialogTrigger
                    render={
                        trigger ?? (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-primary hover:bg-primary/10 hover:text-primary"
                                aria-label={`Gestionar stock de ${product.name}`}
                            >
                                <PackagePlus className="size-4" />
                            </Button>
                        )
                    }
                />
            )}

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Gestionar stock</DialogTitle>
                </DialogHeader>

                <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="font-medium">{product.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Stock actual:{' '}
                        <span className="font-semibold text-foreground">
                            {product.product_stock?.quantity ?? 0}
                        </span>
                    </p>
                </div>

                <Form
                    action={action}
                    method="post"
                    className="space-y-4"
                    resetOnSuccess
                    onSuccess={() => handleOpenChange(false)}
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor={`movement-${product.id}`}>
                                    Movimiento
                                </Label>

                                <Select
                                    value={movementType}
                                    onValueChange={(value) =>
                                        setMovementType(
                                            (value ?? 'add') as MovementType,
                                        )
                                    }
                                >
                                    <SelectTrigger
                                        id={`movement-${product.id}`}
                                        className="w-full"
                                    >
                                        <SelectValue>
                                            {movementLabels[movementType]}
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="add">
                                            Entrada
                                        </SelectItem>
                                        <SelectItem value="adjust">
                                            Cantidad disponible final
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor={`quantity-${product.id}`}>
                                    {isAdjustment
                                        ? 'Cantidad final'
                                        : 'Cantidad'}
                                </Label>

                                <Input
                                    id={`quantity-${product.id}`}
                                    name="quantity"
                                    type="number"
                                    min={isAdjustment ? 0 : 1}
                                    step="1"
                                    required
                                    placeholder={
                                        isAdjustment ? 'Ej. 25' : 'Ej. 10'
                                    }
                                />

                                {errors.quantity && (
                                    <p className="text-sm text-destructive">
                                        {errors.quantity}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor={`description-${product.id}`}>
                                    Descripción
                                    <span className="ml-1 text-muted-foreground">
                                        (opcional)
                                    </span>
                                </Label>

                                <Textarea
                                    id={`description-${product.id}`}
                                    name="description"
                                    rows={3}
                                    placeholder="Motivo del movimiento"
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Guardando...'
                                        : `Registrar ${movementLabels[movementType].toLowerCase()}`}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
