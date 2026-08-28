import { Form } from '@inertiajs/react';
import { Plus, UtensilsCrossed } from 'lucide-react';
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
import { store as storeItemRoute } from '@/routes/orders/items';
import { MenuModality, Order, Product } from '@/types/restaurant';

type Props = {
    order: Order | null;
    products: Product[];
    menuModalities: MenuModality[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function AddItemModal({
    order,
    products,
    menuModalities,
    open,
    onOpenChange,
}: Props) {
    const [itemType, setItemType] = useState<'product' | 'modality'>('product');
    const [productId, setProductId] = useState<string>('');
    const [menuModalityId, setMenuModalityId] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [notes, setNotes] = useState<string>('');

    if (!order) {
        return null;
    }

    const resetForm = () => {
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
                        <Plus className="size-5 text-primary" />
                        Agregar Producto a Comanda #{order.id}
                    </DialogTitle>
                    <DialogDescription>
                        Selecciona un producto del catálogo o un menú ejecutivo para agregar a este pedido.
                    </DialogDescription>
                </DialogHeader>

                <Form
                    action={storeItemRoute(order)}
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
                                <Label>Tipo de Ítem</Label>
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
                            </div>

                            {itemType === 'product' ? (
                                <div className="space-y-2">
                                    <Label htmlFor="product_id">Producto</Label>
                                    <input type="hidden" name="product_id" value={productId} />
                                    <Select
                                        value={productId}
                                        onValueChange={(val) => setProductId(val ?? '')}
                                    >
                                        <SelectTrigger id="product_id" className="w-full">
                                            <SelectValue placeholder="Selecciona un producto" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map((p) => (
                                                <SelectItem key={p.id} value={p.id.toString()}>
                                                    {p.name} - S/. {Number(p.price).toFixed(2)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.product_id && (
                                        <p className="text-xs text-destructive">{errors.product_id}</p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="menu_modality_id">Modalidad de Menú</Label>
                                    <input type="hidden" name="menu_modality_id" value={menuModalityId} />
                                    <Select
                                        value={menuModalityId}
                                        onValueChange={(val) => setMenuModalityId(val ?? '')}
                                    >
                                        <SelectTrigger id="menu_modality_id" className="w-full">
                                            <SelectValue placeholder="Selecciona una opción de menú" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {menuModalities.map((m) => (
                                                <SelectItem key={m.id} value={m.id.toString()}>
                                                    {m.name} - S/. {Number(m.price).toFixed(2)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.menu_modality_id && (
                                        <p className="text-xs text-destructive">{errors.menu_modality_id}</p>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="quantity">Cantidad</Label>
                                <Input
                                    id="quantity"
                                    name="quantity"
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                />
                                {errors.quantity && (
                                    <p className="text-xs text-destructive">{errors.quantity}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notas para Cocina (opcional)</Label>
                                <Input
                                    id="notes"
                                    name="notes"
                                    type="text"
                                    placeholder="Ej. Sin sal, crema aparte, término medio"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                                {errors.notes && (
                                    <p className="text-xs text-destructive">{errors.notes}</p>
                                )}
                            </div>

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
                                    disabled={
                                        processing ||
                                        (itemType === 'product' && !productId) ||
                                        (itemType === 'modality' && !menuModalityId)
                                    }
                                >
                                    {processing ? 'Guardando...' : 'Agregar a Comanda'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
