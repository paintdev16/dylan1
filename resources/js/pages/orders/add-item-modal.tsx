import { Form } from '@inertiajs/react';
import { Plus } from 'lucide-react';
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
import { DailyMenuProduct, MenuModality, Order, Product } from '@/types/restaurant';

type Props = {
    order: Order | null;
    products: Product[];
    menuModalities: MenuModality[];
    dailyMenuProducts?: DailyMenuProduct[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function AddItemModal({
    order,
    products,
    menuModalities,
    dailyMenuProducts = [],
    open,
    onOpenChange,
}: Props) {
    const [itemType, setItemType] = useState<'product' | 'modality'>('product');
    const [productId, setProductId] = useState<string>('');
    const [menuModalityId, setMenuModalityId] = useState<string>('');
    const [selectedSegundoId, setSelectedSegundoId] = useState<string>('');
    const [selectedEntradaId, setSelectedEntradaId] = useState<string>('');
    const [selectedPostreId, setSelectedPostreId] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [notes, setNotes] = useState<string>('');

    if (!order) {
        return null;
    }

    const resetForm = () => {
        setItemType('product');
        setProductId('');
        setMenuModalityId('');
        setSelectedSegundoId('');
        setSelectedEntradaId('');
        setSelectedPostreId('');
        setQuantity(1);
        setNotes('');
    };

    const selectedModality = menuModalities.find((m) => m.id.toString() === menuModalityId);
    const modalityName = selectedModality?.name.toLowerCase() ?? '';

    const isCompleto = modalityName.includes('completo');
    const isSoloSegundo = modalityName.includes('segundo');
    const isEntradaPostre = modalityName.includes('entrada') && modalityName.includes('postre');

    const segundos = dailyMenuProducts.filter(
        (p) => p.product?.menu_subcategory_type?.name === 'Segundos'
    );
    const entradas = dailyMenuProducts.filter(
        (p) => p.product?.menu_subcategory_type?.name === 'Entradas'
    );
    const postres = dailyMenuProducts.filter(
        (p) => p.product?.menu_subcategory_type?.name === 'Postres'
    );

    const isModalityReady = () => {
        if (!selectedModality) return false;
        if (isCompleto) {
            return selectedSegundoId !== '' && selectedEntradaId !== '' && selectedPostreId !== '';
        }
        if (isSoloSegundo) {
            return selectedSegundoId !== '';
        }
        if (isEntradaPostre) {
            return selectedEntradaId !== '' && selectedPostreId !== '';
        }
        return true;
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
                        Selecciona un plato a la carta, bebida o menú del día para agregar a este pedido.
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
                                        Carta / Bebidas
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
                                        Menú del Día
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
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="menu_modality_id">Modalidad de Menú</Label>
                                        <input type="hidden" name="menu_modality_id" value={menuModalityId} />
                                        <Select
                                            value={menuModalityId}
                                            onValueChange={(val) => {
                                                setMenuModalityId(val ?? '');
                                                setSelectedSegundoId('');
                                                setSelectedEntradaId('');
                                                setSelectedPostreId('');
                                            }}
                                        >
                                            <SelectTrigger id="menu_modality_id" className="w-full">
                                                <SelectValue placeholder="Selecciona una modalidad" />
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

                                    {/* Componentes requeridos */}
                                    {selectedModality && (
                                        <div className="space-y-2.5 rounded-lg border bg-muted/20 p-3">
                                            <span className="text-xs font-semibold text-muted-foreground">
                                                Elección de platos:
                                            </span>

                                            {(isCompleto || isSoloSegundo) && (
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Segundo (Plato de fondo):</Label>
                                                    <input type="hidden" name="components[]" value={selectedSegundoId} />
                                                    <Select
                                                        value={selectedSegundoId}
                                                        onValueChange={(val) => setSelectedSegundoId(val ?? '')}
                                                    >
                                                        <SelectTrigger className="h-8 text-xs">
                                                            <SelectValue placeholder="Selecciona un segundo" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {segundos.map((s) => (
                                                                <SelectItem key={s.id} value={s.id.toString()}>
                                                                    {s.product?.name} ({s.quantity_available} disp.)
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}

                                            {(isCompleto || isEntradaPostre) && (
                                                <>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Entrada:</Label>
                                                        <input type="hidden" name="components[]" value={selectedEntradaId} />
                                                        <Select
                                                            value={selectedEntradaId}
                                                            onValueChange={(val) => setSelectedEntradaId(val ?? '')}
                                                        >
                                                            <SelectTrigger className="h-8 text-xs">
                                                                <SelectValue placeholder="Selecciona una entrada" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {entradas.map((e) => (
                                                                    <SelectItem key={e.id} value={e.id.toString()}>
                                                                        {e.product?.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Postre:</Label>
                                                        <input type="hidden" name="components[]" value={selectedPostreId} />
                                                        <Select
                                                            value={selectedPostreId}
                                                            onValueChange={(val) => setSelectedPostreId(val ?? '')}
                                                        >
                                                            <SelectTrigger className="h-8 text-xs">
                                                                <SelectValue placeholder="Selecciona un postre" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {postres.map((p) => (
                                                                    <SelectItem key={p.id} value={p.id.toString()}>
                                                                        {p.product?.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </>
                                            )}

                                            {errors.components && (
                                                <p className="text-xs text-destructive">{errors.components}</p>
                                            )}
                                        </div>
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
                                        (itemType === 'modality' && (!menuModalityId || !isModalityReady()))
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
