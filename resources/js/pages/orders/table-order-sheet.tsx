import { Form } from '@inertiajs/react';
import { useState } from 'react';
import {
    AlertCircle,
    ClipboardList,
    Coffee,
    Minus,
    Plus,
    Sandwich,
    Users,
    Wallet,
    X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { store } from '@/routes/orders/tables';
import type {
    DailyMenuProduct,
    MenuModality,
    Product,
    RestaurantTable,
} from '@/types/restaurant';

type Props = {
    table: RestaurantTable | null;
    products: Product[];
    modalities: MenuModality[];
    dailyMenuProducts: DailyMenuProduct[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type Kind = 'food' | 'beverage' | 'modality';
type ComboboxOption = { value: string; label: string; price: number };
type OrderDraft = {
    product_id?: string;
    menu_modality_id?: string;
    components: string[];
    quantity: number;
    notes: string;
    label: string;
    price: number;
    counts_as_customer: boolean;
};

const KIND_CONFIG: Record<Kind, { label: string; icon: typeof Sandwich }> = {
    food: { label: 'Platos especiales', icon: Sandwich },
    beverage: { label: 'Bebidas', icon: Coffee },
    modality: { label: 'Menú económico', icon: Wallet },
};

// Qué tipos de componente (Segundos/Entradas/Postres) exige cada modalidad
const REQUIRED_TYPES_BY_MODALITY: Record<string, string[]> = {
    full_menu: ['Segundos', 'Entradas', 'Postres'],
    main_only: ['Segundos'],
    starter_dessert: ['Entradas', 'Postres'],
};

const money = (value: number | string) => `S/. ${Number(value).toFixed(2)}`;

function OrderCombobox({
    value,
    onValueChange,
    options,
    placeholder,
}: {
    value: string;
    onValueChange: (value: string | null) => void;
    options: ComboboxOption[];
    placeholder: string;
}) {
    return (
        <Combobox
            items={options}
            value={options.find((option) => option.value === value) ?? null}
            onValueChange={(option) =>
                onValueChange((option as ComboboxOption | null)?.value ?? null)
            }
            itemToStringValue={(option) => option.label}
        >
            <ComboboxInput placeholder={placeholder} className="w-full" />
            <ComboboxContent>
                <ComboboxEmpty>No se encontraron opciones.</ComboboxEmpty>
                <ComboboxList>
                    {(option) => (
                        <ComboboxItem key={option.value} value={option}>
                            {option.label}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}

function QuantityStepper({
    value,
    onChange,
}: {
    value: number;
    onChange: (value: number) => void;
}) {
    return (
        <div className="flex items-center gap-1 rounded-md border">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0"
                disabled={value <= 1}
                onClick={() => onChange(Math.max(1, value - 1))}
            >
                <Minus className="h-4 w-4" />
            </Button>
            <Input
                id="quantity"
                type="number"
                min="1"
                value={value}
                onChange={(event) =>
                    onChange(Math.max(1, Number(event.target.value) || 1))
                }
                className="h-9 w-14 [appearance:textfield] border-0 text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() => onChange(value + 1)}
            >
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    );
}

export function TableOrderSheet({
    table,
    products,
    modalities,
    dailyMenuProducts,
    open,
    onOpenChange,
}: Props) {
    const isMobile = useIsMobile();
    const [kind, setKind] = useState<Kind>('food');
    const [selection, setSelection] = useState('');
    const [components, setComponents] = useState<Record<string, string>>({});
    const [hasConfirmedFirstOrder, setHasConfirmedFirstOrder] = useState(false);
    const [orderDrafts, setOrderDrafts] = useState<OrderDraft[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');
    const [customerCount, setCustomerCount] = useState(1);
    const [requestToken, setRequestToken] = useState(() => crypto.randomUUID());

    if (!table) return null;

    const selectedModality = modalities.find(
        (modality) => String(modality.id) === selection,
    );
    const requiredTypes = selectedModality
        ? (REQUIRED_TYPES_BY_MODALITY[selectedModality.code] ?? [])
        : [];

    const isAvailable = table.status === 'available';
    const canOpenTable = isAvailable && !hasConfirmedFirstOrder;

    const byType = (type: string) => {
        const modalityType = {
            Segundos: 'segundo',
            Entradas: 'entrada',
            Postres: 'postre',
        }[type];

        return dailyMenuProducts.filter(
            (item) =>
                item.product?.menu_subcategory_type?.name === type &&
                item.quantity_available > 0 &&
                (selectedModality?.items ?? []).some(
                    (modalityItem) =>
                        modalityItem.daily_menu_product_id === item.id &&
                        modalityItem.item_type === modalityType,
                ),
        );
    };

    const productOptions: ComboboxOption[] =
        kind === 'food'
            ? dailyMenuProducts
                  .filter(
                      (item) =>
                          item.product?.menu_subcategory?.name ===
                          'Platos Especiales',
                  )
                  .map((item) => ({
                      value: String(item.product_id),
                      price: Number(item.price),
                      label: `${item.product.name} · ${money(item.price)} · ${item.quantity_available} disp.`,
                  }))
            : products.map((product) => ({
                  value: String(product.id),
                  price: Number(product.price),
                  label: `${product.name} · ${money(product.price)} · ${product.product_stock?.quantity ?? 0} disp.`,
              }));

    const modalityOptions: ComboboxOption[] = modalities.map((modality) => ({
        value: String(modality.id),
        price: Number(modality.price),
        label: `${modality.name} · ${money(modality.price)}`,
    }));

    const activeOptions =
        kind === 'modality' ? modalityOptions : productOptions;
    const selectedOption = activeOptions.find(
        (item) => item.value === selection,
    );

    const reset = () => {
        setKind('food');
        setSelection('');
        setComponents({});
        setQuantity(1);
        setNotes('');
    };

    const closeAndReset = () => {
        reset();
        setHasConfirmedFirstOrder(false);
        setOrderDrafts([]);
        setCustomerCount(1);
        setRequestToken(crypto.randomUUID());
    };

    const isDraftIncomplete =
        !selection || requiredTypes.some((type) => !components[type]);

    const updateCustomerCount = (drafts: OrderDraft[]) => {
        setCustomerCount(
            Math.max(
                1,
                drafts
                    .filter((draft) => draft.counts_as_customer)
                    .reduce((total, draft) => total + draft.quantity, 0),
            ),
        );
    };

    const addDraft = () => {
        if (isDraftIncomplete || !selectedOption) return;

        setOrderDrafts((current) => {
            const drafts = [
                ...current,
                {
                    ...(kind === 'modality'
                        ? { menu_modality_id: selection }
                        : { product_id: selection }),
                    components: Object.values(components).filter(Boolean),
                    quantity,
                    notes,
                    label: selectedOption.label.split(' · ')[0],
                    price: selectedOption.price,
                    counts_as_customer: kind !== 'beverage',
                },
            ];

            updateCustomerCount(drafts);

            return drafts;
        });
        reset();
    };

    const removeDraft = (index: number) =>
        setOrderDrafts((current) => {
            const drafts = current.filter((_, i) => i !== index);
            updateCustomerCount(drafts);

            return drafts;
        });

    const orderTotal = orderDrafts.reduce(
        (sum, draft) => sum + draft.price * draft.quantity,
        0,
    );

    return (
        <Drawer
            open={open}
            showSwipeHandle={isMobile}
            swipeDirection={isMobile ? 'down' : 'right'}
            onOpenChange={(value) => {
                onOpenChange(value);
                if (!value) closeAndReset();
            }}
        >
            <DrawerContent className="overflow-y-auto">
                <DrawerHeader className="space-y-1 border-b">
                    <div className="flex items-center justify-between gap-2">
                        <DrawerTitle>Mesa {table.number}</DrawerTitle>
                        <Badge variant={canOpenTable ? 'secondary' : 'default'}>
                            {canOpenTable ? 'Nueva atención' : 'En atención'}
                        </Badge>
                    </div>
                    <DrawerDescription>
                        {canOpenTable
                            ? 'Confirma el primer pedido para abrir automáticamente la mesa y la cuenta.'
                            : `Consumo actual: ${money(table.active_session?.bill?.total_amount ?? 0)}`}
                    </DrawerDescription>
                </DrawerHeader>

                <div className="space-y-5 p-4">
                    {table.active_session && (
                        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5" />
                                {table.active_session.customer_count} comensales
                            </span>
                            <span>
                                Mozo: {table.active_session.waiter?.name}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <ClipboardList className="h-3.5 w-3.5" />
                                {table.active_session.bill?.orders?.length ??
                                    0}{' '}
                                comandas
                            </span>
                        </div>
                    )}

                    <Form
                        {...store.form(table)}
                        onSuccess={() => {
                            setHasConfirmedFirstOrder(true);
                            reset();
                            setOrderDrafts([]);
                            onOpenChange(false);
                        }}
                        className="space-y-5"
                    >
                        {({ errors, processing, clearErrors }) => (
                            <>
                                {canOpenTable && (
                                    <input
                                        type="hidden"
                                        name="customer_count"
                                        value={customerCount}
                                    />
                                )}
                                <div>
                                    <p className="mb-2 text-sm font-medium">
                                        ¿Qué vas a agregar?
                                    </p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(
                                            Object.entries(KIND_CONFIG) as [
                                                Kind,
                                                (typeof KIND_CONFIG)[Kind],
                                            ][]
                                        ).map(
                                            ([
                                                value,
                                                { label, icon: Icon },
                                            ]) => (
                                                <Button
                                                    key={value}
                                                    type="button"
                                                    variant={
                                                        kind === value
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    className="h-auto flex-col gap-1.5 py-3"
                                                    onClick={() => {
                                                        setKind(value);
                                                        setSelection('');
                                                        setComponents({});
                                                        clearErrors();
                                                    }}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    <span className="text-xs">
                                                        {label}
                                                    </span>
                                                </Button>
                                            ),
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Producto o modalidad</Label>
                                    <OrderCombobox
                                        value={selection}
                                        onValueChange={(value) => {
                                            setSelection(value ?? '');
                                            setComponents({});
                                            clearErrors();
                                        }}
                                        options={activeOptions}
                                        placeholder="Selecciona una opción"
                                    />
                                </div>

                                {requiredTypes.map((type) => (
                                    <div key={type} className="space-y-2">
                                        <Label>{type}</Label>
                                        <OrderCombobox
                                            value={components[type] ?? ''}
                                            onValueChange={(value) => {
                                                clearErrors();
                                                setComponents((current) => ({
                                                    ...current,
                                                    [type]: value ?? '',
                                                }));
                                            }}
                                            options={byType(type).map(
                                                (item) => ({
                                                    value: String(item.id),
                                                    price: 0,
                                                    label: `${item.product.name} · ${item.quantity_available} disp.`,
                                                }),
                                            )}
                                            placeholder={`Selecciona ${type.toLowerCase()}`}
                                        />
                                    </div>
                                ))}

                                {selectedOption && (
                                    <div className="flex items-center justify-between rounded-lg border border-dashed p-3 text-sm">
                                        <span className="font-medium">
                                            {
                                                selectedOption.label.split(
                                                    ' · ',
                                                )[0]
                                            }
                                        </span>
                                        <span className="text-muted-foreground">
                                            {money(selectedOption.price)} c/u
                                        </span>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="quantity">
                                            Cantidad
                                        </Label>
                                        <QuantityStepper
                                            value={quantity}
                                            onChange={setQuantity}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">
                                            Observaciones
                                        </Label>
                                        <Input
                                            id="notes"
                                            name="notes"
                                            placeholder="Sin cebolla..."
                                            value={notes}
                                            onChange={(event) =>
                                                setNotes(event.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                {(errors.product_id ||
                                    errors.menu_modality_id ||
                                    errors.components ||
                                    errors.table) && (
                                    <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                        <span>
                                            {errors.product_id ||
                                                errors.menu_modality_id ||
                                                errors.components ||
                                                errors.table}
                                        </span>
                                    </div>
                                )}

                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="w-full"
                                    disabled={isDraftIncomplete}
                                    onClick={addDraft}
                                >
                                    <Plus className="h-4 w-4" />
                                    Agregar al pedido
                                </Button>

                                <Separator />

                                <div className="space-y-2">
                                    <p className="text-sm font-semibold">
                                        Pedido a confirmar
                                    </p>
                                    {orderDrafts.length === 0 ? (
                                        <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                                            Aún no agregaste productos.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {orderDrafts.map((draft, index) => (
                                                <div
                                                    key={`${draft.label}-${index}`}
                                                    className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 p-2.5 text-sm"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium">
                                                            {draft.quantity}×{' '}
                                                            {draft.label}
                                                        </p>
                                                        {draft.notes && (
                                                            <p className="truncate text-xs text-muted-foreground">
                                                                {draft.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex shrink-0 items-center gap-2">
                                                        <span className="text-muted-foreground">
                                                            {money(
                                                                draft.price *
                                                                    draft.quantity,
                                                            )}
                                                        </span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() =>
                                                                removeDraft(
                                                                    index,
                                                                )
                                                            }
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="flex items-center justify-between px-1 pt-1 text-sm font-semibold">
                                                <span>Total</span>
                                                <span>{money(orderTotal)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {orderDrafts.map((draft, index) => (
                                    <div key={`fields-${index}`}>
                                        <input
                                            type="hidden"
                                            name={`items[${index}][product_id]`}
                                            value={draft.product_id ?? ''}
                                        />
                                        <input
                                            type="hidden"
                                            name={`items[${index}][menu_modality_id]`}
                                            value={draft.menu_modality_id ?? ''}
                                        />
                                        <input
                                            type="hidden"
                                            name={`items[${index}][quantity]`}
                                            value={draft.quantity}
                                        />
                                        <input
                                            type="hidden"
                                            name={`items[${index}][notes]`}
                                            value={draft.notes}
                                        />
                                        {draft.components.map((component) => (
                                            <input
                                                key={component}
                                                type="hidden"
                                                name={`items[${index}][components][]`}
                                                value={component}
                                            />
                                        ))}
                                    </div>
                                ))}
                                <input
                                    type="hidden"
                                    name="request_token"
                                    value={requestToken}
                                />
                                <input
                                    type="hidden"
                                    name="product_id"
                                    value={orderDrafts[0]?.product_id ?? ''}
                                />
                                <input
                                    type="hidden"
                                    name="menu_modality_id"
                                    value={
                                        orderDrafts[0]?.menu_modality_id ?? ''
                                    }
                                />
                                <input
                                    type="hidden"
                                    name="quantity"
                                    value={orderDrafts[0]?.quantity ?? 1}
                                />

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={
                                        processing || orderDrafts.length === 0
                                    }
                                >
                                    {processing
                                        ? 'Confirmando...'
                                        : canOpenTable
                                          ? 'Abrir mesa y confirmar pedido'
                                          : 'Confirmar pedido'}
                                </Button>
                                <p className="text-center text-xs text-muted-foreground">
                                    Agrega todos los consumos y confirma una
                                    sola vez para enviarlos a cocina.
                                </p>
                            </>
                        )}
                    </Form>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
