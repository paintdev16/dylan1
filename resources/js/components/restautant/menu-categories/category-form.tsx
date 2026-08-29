import { Form } from '@inertiajs/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { MenuCategory } from '@/types/restaurant';
import { store, update } from '@/routes/menu-categories';

type Props = {
    category?: MenuCategory;
    action: ReturnType<typeof store> | ReturnType<typeof update>;
    method: 'post' | 'put';
    submitLabel: string;
    onSuccess: () => void;
};

export function CategoryForm({
    category,
    action,
    method,
    submitLabel,
    onSuccess,
}: Props) {
    const [hasVersions, setHasVersions] = useState(
        category?.has_versions ?? false,
    );

    const [active, setActive] = useState(category?.active ?? true);

    return (
        <Form
            action={action}
            method={method}
            className="space-y-6"
            onSuccess={onSuccess}
        >
            {({ errors, processing }) => (
                <>
                    {/* Nombre */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre de categoría</Label>

                        <Input
                            id="name"
                            name="name"
                            type="text"
                            defaultValue={category?.name ?? ''}
                            placeholder="Ej. Segundos"
                        />

                        {errors.name && (
                            <p className="text-sm text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Orden */}
                    <div className="space-y-2">
                        <Label htmlFor="display_order">
                            Orden de visualización
                        </Label>

                        <Input
                            id="display_order"
                            name="display_order"
                            type="number"
                            min="0"
                            defaultValue={category?.display_order ?? 0}
                            placeholder="Ej. 1"
                        />

                        {errors.display_order && (
                            <p className="text-sm text-destructive">
                                {errors.display_order}
                            </p>
                        )}
                    </div>

                    {/* Tiene versiones */}
                    <div className="flex items-start space-x-3">
                        <Checkbox
                            id="has_versions"
                            checked={hasVersions}
                            onCheckedChange={(checked) =>
                                setHasVersions(checked === true)
                            }
                        />

                        <div className="space-y-1">
                            <input
                                type="hidden"
                                name="has_versions"
                                value={hasVersions ? '1' : '0'}
                            />

                            <Label
                                htmlFor="has_versions"
                                className="cursor-pointer"
                            >
                                Esta categoría maneja versiones
                            </Label>

                            <p className="text-sm text-muted-foreground">
                                Permite opciones como completo, solo segundo o
                                solo entrada/postre.
                            </p>
                        </div>
                    </div>

                    {errors.has_versions && (
                        <p className="text-sm text-destructive">
                            {errors.has_versions}
                        </p>
                    )}

                    {/* Estado */}
                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="active"
                            checked={active}
                            onCheckedChange={(checked) =>
                                setActive(checked === true)
                            }
                        />

                        <input
                            type="hidden"
                            name="active"
                            value={active ? '1' : '0'}
                        />

                        <Label htmlFor="active" className="cursor-pointer">
                            Categoría activa
                        </Label>
                    </div>

                    {errors.active && (
                        <p className="text-sm text-destructive">
                            {errors.active}
                        </p>
                    )}

                    {/* Acciones */}
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
