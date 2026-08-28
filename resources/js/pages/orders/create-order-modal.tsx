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
import { Bill, DailyMenuProduct, MenuModality, Product } from '@/types/restaurant';

type Props = {
    openBills: Bill[];
    products: Product[];
    menuModalities: MenuModality[];
    dailyMenuProducts?: DailyMenuProduct[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function CreateOrderModal({
    openBills,
    products,
    menuModalities,
    dailyMenuProducts = [],
    open,
    onOpenChange,
}: Props) {
    const [billId, setBillId] = useState<string>('');
    const [includeItem, setIncludeItem] = useState<boolean>(false);
    const [itemType, setItemType] = useState<'product' | 'modality'>('product');
    const [productId, setProductId] = useState<string>('');
    const [menuModalityId, setMenuModalityId] = useState<string>('');
    const [selectedSegundoId, setSelectedSegundoId] = useState<string>('');
    const [selectedEntradaId, setSelectedEntradaId] = useState<string>('');
    const [selectedPostreId, setSelectedPostreId] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [notes, setNotes] = useState<string>('');

    const resetForm = () => {
        setBillId('');
        setIncludeItem(false);
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
        if (!includeItem || itemType !== 'modality') return true;
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
                                    {includeItem ? 'Quitar Plato Inicial' : '+ Agregar Plato Inicial'}
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
                                        <div className="space-y-2">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="menu_modality_id" className="text-xs">Modalidad Menú</Label>
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

                                            {selectedModality && (
                                                <div className="space-y-2 rounded border bg-background/80 p-2">
                                                    <span className="text-xs font-semibold text-muted-foreground">
                                                        Selecciona los componentes:
                                                    </span>

                                                    {(isCompleto || isSoloSegundo) && (
                                                        <div className="space-y-1">
                                                            <Label className="text-xs">Segundo:</Label>
                                                            <input type="hidden" name="components[]" value={selectedSegundoId} />
                                                            <Select
                                                                value={selectedSegundoId}
                                                                onValueChange={(val) => setSelectedSegundoId(val ?? '')}
                                                            >
                                                                <SelectTrigger className="h-8 text-xs">
                                                                    <SelectValue placeholder="Segundo" />
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
                                                                        <SelectValue placeholder="Entrada" />
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
                                                                        <SelectValue placeholder="Postre" />
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
                                                </div>
                                            )}
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
                                    disabled={
                                        processing ||
                                        !billId ||
                                        (includeItem && itemType === 'product' && !productId) ||
                                        (includeItem && itemType === 'modality' && (!menuModalityId || !isModalityReady()))
                                    }
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
