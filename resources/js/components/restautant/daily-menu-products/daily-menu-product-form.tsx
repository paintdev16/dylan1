import { Form } from '@inertiajs/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import {
    DailyMenu,
    DailyMenuProduct,
    MenuSubcategory,
    Product,
} from '@/types/restaurant';

import { store, update } from '@/routes/daily-menu-products';

type Props = {
    dailyMenuProduct?: DailyMenuProduct;
    products: Product[];
    menuSubcategories: MenuSubcategory[];
    dailyMenu: DailyMenu;
    action: ReturnType<typeof store> | ReturnType<typeof update>;
    method: 'post' | 'put';
    submitLabel: string;
    onSuccess: () => void;
};

export function DailyMenuProductForm({
    dailyMenuProduct,
    products,
    menuSubcategories,
    dailyMenu,
    action,
    method,
    submitLabel,
    onSuccess,
}: Props) {
    const initialProduct =
        products.find(
            (product) => product.id === dailyMenuProduct?.product_id,
        ) ?? dailyMenuProduct?.product;

    const [subcategoryId, setSubcategoryId] = useState<string>(
        initialProduct?.menu_subcategory_id?.toString() ?? '',
    );

    const [typeId, setTypeId] = useState<string>(
        initialProduct?.menu_subcategory_type_id?.toString() ?? '',
    );

    const [productId, setProductId] = useState<string>(
        dailyMenuProduct?.product_id?.toString() ?? '',
    );

    const [price, setPrice] = useState<string>(
        dailyMenuProduct?.price?.toString() ?? '',
    );

    const [active, setActive] = useState<string>(
        dailyMenuProduct?.active ? '1' : '0',
    );

    const selectedSubcategory = menuSubcategories.find(
        (subcategory) => subcategory.id.toString() === subcategoryId,
    );

    const selectedType = selectedSubcategory?.types?.find(
        (type) => type.id.toString() === typeId,
    );

    const requiresType = selectedSubcategory?.code === 'economic_menu';

    const filteredProducts = products.filter((product) => {
        if (product.menu_subcategory_id?.toString() !== subcategoryId) {
            return false;
        }

        if (typeId) {
            return product.menu_subcategory_type_id?.toString() === typeId;
        }

        return !requiresType || product.menu_subcategory_type_id !== null;
    });

    const handleSubcategoryChange = (value: string | null) => {
        const newSubcategoryId = value ?? '';

        setSubcategoryId(newSubcategoryId);
        setTypeId('');
        setProductId('');
        setPrice('');
    };

    const handleTypeChange = (value: string | null) => {
        const newTypeId = value ?? '';

        setTypeId(newTypeId);
        setProductId('');
        setPrice('');
    };

    const handleProductChange = (value: string | null) => {
        if (!value) {
            setProductId('');
            setPrice('');
            return;
        }

        const product = products.find((item) => item.id.toString() === value);

        if (!product) {
            setProductId('');
            setPrice('');
            return;
        }

        if (product.menu_subcategory_id?.toString() !== subcategoryId) {
            setProductId('');
            setPrice('');
            return;
        }

        if (typeId && product.menu_subcategory_type_id?.toString() !== typeId) {
            setProductId('');
            setPrice('');
            return;
        }

        setTypeId(product.menu_subcategory_type_id?.toString() ?? '');
        setProductId(value);
        setPrice(Number(product.price).toFixed(2));
    };

    const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPrice(event.target.value);
    };

    const canSelectProduct = !!subcategoryId;

    return (
        <Form
            action={action}
            method={method}
            className="space-y-6"
            onSuccess={onSuccess}
        >
            {({ errors, processing }) => (
                <>
                    <div className="rounded-lg border bg-muted/30 p-4">
                        <input
                            type="hidden"
                            name="daily_menu_id"
                            value={dailyMenu.id}
                        />

                        <p className="text-sm font-medium">Menú del día</p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {dailyMenu.formatted_date}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="menu-type">Tipo de menú</Label>

                            <Select
                                value={subcategoryId}
                                onValueChange={handleSubcategoryChange}
                            >
                                <SelectTrigger
                                    id="menu-type"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Selecciona un tipo de menú">
                                        {selectedSubcategory?.name ??
                                            'Selecciona un tipo de menú'}
                                    </SelectValue>
                                </SelectTrigger>

                                <SelectContent>
                                    {menuSubcategories.map((subcategory) => (
                                        <SelectItem
                                            key={subcategory.id}
                                            value={subcategory.id.toString()}
                                        >
                                            {subcategory.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <input
                                type="hidden"
                                name="menu_subcategory_id"
                                value={subcategoryId}
                            />

                            {errors.menu_subcategory_id && (
                                <p className="text-sm text-destructive">
                                    {errors.menu_subcategory_id}
                                </p>
                            )}
                        </div>

                        {subcategoryId &&
                            selectedSubcategory?.types &&
                            selectedSubcategory.types.length > 0 && (
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="menu-subcategory-type">
                                        Tipo de producto
                                        {!requiresType && (
                                            <span className="ml-1 text-muted-foreground">
                                                (opcional)
                                            </span>
                                        )}
                                    </Label>

                                    <Select
                                        value={typeId}
                                        onValueChange={handleTypeChange}
                                    >
                                        <SelectTrigger
                                            id="menu-subcategory-type"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Selecciona un tipo de producto">
                                                {selectedType?.name ??
                                                    'Selecciona un tipo de producto'}
                                            </SelectValue>
                                        </SelectTrigger>

                                        <SelectContent>
                                            {!requiresType && (
                                                <SelectItem value="">
                                                    Todos
                                                </SelectItem>
                                            )}

                                            {selectedSubcategory.types.map(
                                                (type) => (
                                                    <SelectItem
                                                        key={type.id}
                                                        value={type.id.toString()}
                                                    >
                                                        {type.name}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>

                                    <input
                                        type="hidden"
                                        name="menu_subcategory_type_id"
                                        value={typeId}
                                    />

                                    {errors.menu_subcategory_type_id && (
                                        <p className="text-sm text-destructive">
                                            {errors.menu_subcategory_type_id}
                                        </p>
                                    )}
                                </div>
                            )}

                        {canSelectProduct && (
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="product_id">Producto</Label>

                                {requiresType && !typeId && (
                                    <p className="text-sm text-muted-foreground">
                                        Puedes seleccionar un producto para
                                        completar su tipo automáticamente.
                                    </p>
                                )}

                                <input
                                    type="hidden"
                                    name="product_id"
                                    value={productId}
                                />

                                <Combobox
                                    items={filteredProducts}
                                    value={
                                        filteredProducts.find(
                                            (product) =>
                                                product.id.toString() ===
                                                productId,
                                        ) ?? null
                                    }
                                    onValueChange={(product) =>
                                        handleProductChange(
                                            (
                                                product as Product | null
                                            )?.id.toString() ?? null,
                                        )
                                    }
                                    itemToStringLabel={(product) =>
                                        product.name
                                    }
                                    itemToStringValue={(product) =>
                                        product.id.toString()
                                    }
                                >
                                    <ComboboxInput
                                        id="product_id"
                                        placeholder="Busca o selecciona un producto"
                                        className="w-full"
                                    />
                                    <ComboboxContent>
                                        <ComboboxEmpty>
                                            No se encontraron productos.
                                        </ComboboxEmpty>
                                        <ComboboxList>
                                            {(product) => (
                                                <ComboboxItem
                                                    key={product.id}
                                                    value={product}
                                                >
                                                    {product.name}
                                                </ComboboxItem>
                                            )}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>

                                {errors.product_id && (
                                    <p className="text-sm text-destructive">
                                        {errors.product_id}
                                    </p>
                                )}
                            </div>
                        )}

                        {productId && (
                            <div className="space-y-2">
                                <Label htmlFor="price">Precio del menú</Label>

                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={price}
                                    onChange={handlePriceChange}
                                    placeholder="Ej. 9.00"
                                />

                                {errors.price && (
                                    <p className="text-sm text-destructive">
                                        {errors.price}
                                    </p>
                                )}
                            </div>
                        )}

                        {productId && (
                            <div className="space-y-2">
                                <Label htmlFor="quantity_available">
                                    Cantidad disponible
                                </Label>

                                <Input
                                    id="quantity_available"
                                    name="quantity_available"
                                    type="number"
                                    min="0"
                                    step="1"
                                    defaultValue={
                                        dailyMenuProduct?.quantity_available ??
                                        0
                                    }
                                    placeholder="Ej. 50"
                                />

                                {errors.quantity_available && (
                                    <p className="text-sm text-destructive">
                                        {errors.quantity_available}
                                    </p>
                                )}
                            </div>
                        )}

                        {productId && (
                            <div className="space-y-2">
                                <Label htmlFor="display_order">
                                    Orden de visualización
                                </Label>

                                <Input
                                    id="display_order"
                                    name="display_order"
                                    type="number"
                                    min="0"
                                    step="1"
                                    defaultValue={
                                        dailyMenuProduct?.display_order ?? 0
                                    }
                                    placeholder="Ej. 1"
                                />

                                {errors.display_order && (
                                    <p className="text-sm text-destructive">
                                        {errors.display_order}
                                    </p>
                                )}
                            </div>
                        )}

                        {productId && (
                            <div className="space-y-2">
                                <Label htmlFor="active">Estado</Label>

                                <input
                                    type="hidden"
                                    name="active"
                                    value={active}
                                />

                                <Select
                                    value={active}
                                    onValueChange={(value) =>
                                        setActive(value ?? '1')
                                    }
                                >
                                    <SelectTrigger
                                        id="active"
                                        className="w-full"
                                    >
                                        <SelectValue>
                                            {active === '1'
                                                ? 'Activo'
                                                : 'Inactivo'}
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="1">
                                            Activo
                                        </SelectItem>

                                        <SelectItem value="0">
                                            Inactivo
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                {errors.active && (
                                    <p className="text-sm text-destructive">
                                        {errors.active}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={
                                processing ||
                                !subcategoryId ||
                                !productId ||
                                (requiresType && !typeId)
                            }
                        >
                            {processing ? 'Guardando...' : submitLabel}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
