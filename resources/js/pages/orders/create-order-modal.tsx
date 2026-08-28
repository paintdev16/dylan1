import { Form } from '@inertiajs/react';
import { UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
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
import { store as storeOrderRoute } from '@/routes/orders';
import { Bill, MenuModality, Product } from '@/types/restaurant';

type Props = {
    openBills: Bill[];
    products: Product[];
    menuModalities: MenuModality[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function CreateOrderModal({
    openBills,
    products,
    menuModalities,
    open,
    onOpenChange,
}: Props) {
    const [billId, setBillId] = useState<string>('');
    const [includeItem, setIncludeItem] = useState<boolean>(false);
    const [itemType, setItemType] = useState<'product' | 'modality'>('product');
    const [productId, setProductId] = useState<string>('');
    const [menuModalityId, setMenuModalityId] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [notes, setNotes] = useState<string>('');

    const resetForm = () => {
        setBillId('');
        setIncludeItem(false);
        setItemType('product');
        setProductId('');
        setMenuModalityId('');
        setQuantity(1);
        setNotes('');
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                onOpenChange(isOpen);
                if (!isOpen) {
                    resetForm();
                }
            }}
        >
            <DialogContent className="max-w-md p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UtensilsCrossed className="size-5 text-primary" />
                        Nueva Comanda / Pedido
                    </DialogTitle>
                    <DialogDescription>
                        Selecciona la cuenta abierta para registrar un nuevo pedido.
                    </DialogDescription>
                </DialogHeader>

                <Form
                    action={storeOrderRoute()}
                    method="post"
                    className="space-y-4 pt-2"
                    onSuccess={() => {
                        onOpenChange(false);
                        resetForm();
                    }}
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="bill_id">Cuenta Abierta / Mesa</Label>
                                <input type="hidden" name="bill_id" value={billId} />
                                <Select
                                    value={billId}
                                    onValueChange={(val) => setBillId(val ?? '')}
                                >
                                    <SelectTrigger id="bill_id" className="w-full">
                                        <SelectValue placeholder="Selecciona una cuenta" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {openBills.map((b) => (
                                            <SelectItem key={b.id} value={b.id.toString()}>
                                                Cuenta #{b.id} - {b.order_type === 'dine_in' ? `Mesa ${b.restaurant_table?.number ?? 'Sin mesa'}` : 'Para llevar'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {openBills.length === 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        No hay cuentas abiertas. Primero abre una cuenta en la sección "Cuentas".
                                    </p>
                                )}
                                {errors.bill_id && (
                                    <p className="text-xs text-destructive">{errors.bill_id}</p>
                                )}
                            </div>

                            <div className="pt-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => setIncludeItem(!includeItem)}
                                >
                                    {includeItem ? 'Quitar Producto Inicial' : '+ Agregar Producto Inicial'}
                                </Button>
                            </div>

                            {includeItem && (
                                <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            type="button"
                                            variant={itemType === 'product' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => {
                                                setItemType('product');
                                                setMenuModalityId('');
                                            }}
                                        >
                                            Producto Carta
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={itemType === 'modality' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => {
                                                setItemType('modality');
                                                setProductId('');
                                            }}
                                        >
                                            Menú Ejecutivo
                                        </Button>
                                    </div>

                                    {itemType === 'product' ? (
                                        <div className="space-y-1.5">
                                            <Label htmlFor="product_id" className="text-xs">Producto</Label>
                                            <input type="hidden" name="product_id" value={productId} />
                                            <Select
                                                value={productId}
                                                onValueChange={(val) => setProductId(val ?? '')}
                                            >
                                                <SelectTrigger id="product_id" className="h-9 bg-background">
                                                    <SelectValue placeholder="Selecciona producto" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {products.map((p) => (
                                                        <SelectItem key={p.id} value={p.id.toString()}>
                                                            {p.name} - S/. {Number(p.price).toFixed(2)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5">
                                            <Label htmlFor="menu_modality_id" className="text-xs">Modalidad Menú</Label>
                                            <input type="hidden" name="menu_modality_id" value={menuModalityId} />
                                            <Select
                                                value={menuModalityId}
                                                onValueChange={(val) => setMenuModalityId(val ?? '')}
                                            >
                                                <SelectTrigger id="menu_modality_id" className="h-9 bg-background">
                                                    <SelectValue placeholder="Selecciona menú" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {menuModalities.map((m) => (
                                                        <SelectItem key={m.id} value={m.id.toString()}>
                                                            {m.name} - S/. {Number(m.price).toFixed(2)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="quantity" className="text-xs">Cantidad</Label>
                                            <Input
                                                id="quantity"
                                                name="quantity"
                                                type="number"
                                                min="1"
                                                value={quantity}
                                                onChange={(e) => setQuantity(Number(e.target.value))}
                                                className="h-9 bg-background"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="notes" className="text-xs">Notas Cocina</Label>
                                            <Input
                                                id="notes"
                                                name="notes"
                                                type="text"
                                                placeholder="Ej. sin cebolla"
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                className="h-9 bg-background"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing || !billId}
                                >
                                    {processing ? 'Registrando...' : 'Crear Comanda'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
