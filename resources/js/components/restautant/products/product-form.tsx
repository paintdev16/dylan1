import { useState, type ReactNode } from 'react';
import { Form } from '@inertiajs/react';
import { CircleHelp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { MenuCategory, Product } from '@/types/restaurant';
import { store, update } from '@/routes/products';

type Props = {
    product?: Product;
    categories: MenuCategory[];
    action: ReturnType<typeof store> | ReturnType<typeof update>;
    method: 'post' | 'put';
    submitLabel: string;
    onSuccess: () => void;
    onCancel: () => void;
};

type FieldLabelProps = {
    htmlFor: string;
    children: ReactNode;
    help: string;
};

function FieldLabel({ htmlFor, children, help }: FieldLabelProps) {
    return (
        <div className="flex items-center gap-1.5">
            <Label htmlFor={htmlFor}>{children}</Label>

            <Tooltip>
                <TooltipTrigger
                    render={
                        <button
                            type="button"
                            className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none"
                            aria-label={help}
                        >
                            <CircleHelp className="size-3.5" />
                        </button>
                    }
                />
                <TooltipContent>{help}</TooltipContent>
            </Tooltip>
        </div>
    );
}

export function ProductForm({
    product,
    categories,
    action,
    method,
    submitLabel,
    onSuccess,
    onCancel,
}: Props) {
    const [categoryId, setCategoryId] = useState(
        product?.menu_category_id?.toString() ?? '',
    );

    const [type, setType] = useState<'simple' | 'prepared'>(
        product?.type ?? 'prepared',
    );

    const [status, setStatus] = useState<'activo' | 'inactivo'>(
        product?.status ?? 'activo',
    );

    const selectedCategory = categories.find(
        (category) => category.id.toString() === categoryId,
    );

    const requiresPresentation =
        selectedCategory?.requires_presentation ?? false;

    const isBeverage = selectedCategory?.name === 'Bebidas';

    const canSetInitialStock = !product && selectedCategory?.name === 'Bebidas';

    return (
        <Form
            action={action}
            method={method}
            className="space-y-5"
            onSuccess={onSuccess}
        >
            {({ errors, processing }) => (
                <>
                    <div className="grid grid-cols-1 gap-5 rounded-xl border bg-muted/10 p-4 sm:p-5 md:grid-cols-2">
                        {/* Nombre */}
                        <div className="space-y-2">
                            <FieldLabel
                                htmlFor="name"
                                help="Es el nombre que se mostrará en el catálogo y en las órdenes."
                            >
                                Nombre del producto
                            </FieldLabel>

                            <Input
                                id="name"
                                name="name"
                                type="text"
                                defaultValue={product?.name ?? ''}
                                placeholder="Ej. Lomo Saltado"
                            />

                            {errors.name && (
                                <p className="text-sm text-destructive">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Categoría */}
                        <div className="space-y-2">
                            <FieldLabel
                                htmlFor="menu_category_id"
                                help="La categoría define si el producto es comida o bebida y qué campos se requieren."
                            >
                                Categoría
                            </FieldLabel>

                            <input
                                type="hidden"
                                name="menu_category_id"
                                value={categoryId}
                            />

                            <Select
                                value={categoryId}
                                onValueChange={(value) => {
                                    const newCategoryId = value ?? '';
                                    const newCategory = categories.find(
                                        (category) =>
                                            category.id.toString() ===
                                            newCategoryId,
                                    );

                                    setCategoryId(newCategoryId);

                                    if (newCategory?.name === 'Bebidas') {
                                        setType('simple');
                                    }
                                }}
                            >
                                <SelectTrigger
                                    id="menu_category_id"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Selecciona una categoría">
                                        {selectedCategory?.name ??
                                            'Selecciona una categoría'}
                                    </SelectValue>
                                </SelectTrigger>

                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category.id}
                                            value={category.id.toString()}
                                        >
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {errors.menu_category_id && (
                                <p className="text-sm text-destructive">
                                    {errors.menu_category_id}
                                </p>
                            )}
                        </div>

                        {requiresPresentation && (
                            <div className="space-y-2">
                                <FieldLabel
                                    htmlFor="presentation"
                                    help="Indica el tamaño o formato de la bebida, por ejemplo: 500 ml o 1 L."
                                >
                                    Presentación
                                </FieldLabel>

                                <Input
                                    id="presentation"
                                    name="presentation"
                                    type="text"
                                    defaultValue={product?.presentation ?? ''}
                                    placeholder="Ej. 1L, 2L, 500ml"
                                />

                                {errors.presentation && (
                                    <p className="text-sm text-destructive">
                                        {errors.presentation}
                                    </p>
                                )}
                            </div>
                        )}

                        {canSetInitialStock && (
                            <div className="space-y-2">
                                <FieldLabel
                                    htmlFor="initial_stock"
                                    help="Cantidad física disponible al registrar la bebida por primera vez."
                                >
                                    Cantidad inicial
                                </FieldLabel>

                                <Input
                                    id="initial_stock"
                                    name="initial_stock"
                                    type="number"
                                    min="0"
                                    step="1"
                                    defaultValue="0"
                                    placeholder="Ej. 24"
                                />

                                <p className="text-sm text-muted-foreground">
                                    Se registrará como una entrada de stock al
                                    crear la bebida.
                                </p>

                                {errors.initial_stock && (
                                    <p className="text-sm text-destructive">
                                        {errors.initial_stock}
                                    </p>
                                )}
                            </div>
                        )}

                        {isBeverage && (
                            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground md:col-span-2">
                                Las bebidas se registran automáticamente como
                                productos de venta directa.
                            </div>
                        )}

                        {/* Precio */}
                        <div className="space-y-2">
                            <FieldLabel
                                htmlFor="price"
                                help="Ingresa el precio de venta en soles."
                            >
                                Precio
                            </FieldLabel>

                            <Input
                                id="price"
                                name="price"
                                type="number"
                                min="0"
                                step="0.01"
                                defaultValue={product?.price ?? ''}
                                placeholder="Ej. 18.00"
                            />

                            {errors.price && (
                                <p className="text-sm text-destructive">
                                    {errors.price}
                                </p>
                            )}
                        </div>

                        <input
                            type="hidden"
                            name="type"
                            value={isBeverage ? 'simple' : type}
                        />

                        {!isBeverage && (
                            <div className="space-y-2">
                                <FieldLabel
                                    htmlFor="type"
                                    help="Preparado es elaborado por el restaurante; venta directa se vende tal como se recibe."
                                >
                                    Tipo
                                </FieldLabel>

                                <Select
                                    value={type}
                                    onValueChange={(value) =>
                                        setType(value as 'simple' | 'prepared')
                                    }
                                >
                                    <SelectTrigger id="type" className="w-full">
                                        <SelectValue placeholder="Selecciona un tipo" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="prepared">
                                            Preparado
                                        </SelectItem>

                                        <SelectItem value="simple">
                                            Venta directa
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                {errors.type && (
                                    <p className="text-sm text-destructive">
                                        {errors.type}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Estado */}
                        <div className="space-y-2">
                            <FieldLabel
                                htmlFor="status"
                                help="Los productos inactivos no estarán disponibles para nuevos registros de menú."
                            >
                                Estado
                            </FieldLabel>

                            <input type="hidden" name="status" value={status} />

                            <Select
                                value={status}
                                onValueChange={(value) =>
                                    setStatus(value as 'activo' | 'inactivo')
                                }
                            >
                                <SelectTrigger id="status" className="w-full">
                                    <SelectValue placeholder="Selecciona un estado" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="activo">
                                        Activo
                                    </SelectItem>

                                    <SelectItem value="inactivo">
                                        Inactivo
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            {errors.status && (
                                <p className="text-sm text-destructive">
                                    {errors.status}
                                </p>
                            )}
                        </div>

                        {/* Descripción - ancho completo */}
                        <div className="space-y-2 md:col-span-2">
                            <FieldLabel
                                htmlFor="description"
                                help="Agrega una descripción breve para facilitar su identificación."
                            >
                                Descripción
                            </FieldLabel>

                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={product?.description ?? ''}
                                placeholder="Describe el producto..."
                                rows={4}
                            />

                            {errors.description && (
                                <p className="text-sm text-destructive">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {/* Imagen - ancho completo */}
                        <div className="space-y-2 md:col-span-2">
                            <FieldLabel
                                htmlFor="image"
                                help="Puedes usar una URL o ruta de la imagen del producto."
                            >
                                Imagen
                            </FieldLabel>

                            <Input
                                id="image"
                                name="image"
                                type="text"
                                defaultValue={product?.image ?? ''}
                                placeholder="Ruta o URL de la imagen"
                            />

                            {errors.image && (
                                <p className="text-sm text-destructive">
                                    {errors.image}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={processing}
                        >
                            Cancelar
                        </Button>

                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : submitLabel}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
