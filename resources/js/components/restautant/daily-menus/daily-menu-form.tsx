import { Form } from '@inertiajs/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { DailyMenu } from '@/types/restaurant';
import { store, update } from '@/routes/daily-menus';

type Props = {
    dailyMenu?: DailyMenu;
    action: ReturnType<typeof store> | ReturnType<typeof update>;
    method: 'post' | 'put';
    submitLabel: string;
    onSuccess: () => void;
};

export function DailyMenuForm({
    dailyMenu,
    action,
    method,
    submitLabel,
    onSuccess,
}: Props) {
    const [active, setActive] = useState(
        dailyMenu?.active ?? true,
    );

    return (
        <Form
            action={action}
            method={method}
            className="space-y-6"
            onSuccess={onSuccess}
        >
            {({ errors, processing }) => (
                <>
                    {/* Fecha */}
                    <div className="space-y-2">
                        <Label htmlFor="date">
                            Fecha
                        </Label>

                        <Input
                            id="date"
                            name="date"
                            type="date"
                            defaultValue={dailyMenu?.date}
                        />

                        {errors.date && (
                            <p className="text-sm text-destructive">
                                {errors.date}
                            </p>
                        )}
                    </div>

                    {/* Estado */}
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label
                                htmlFor="active"
                                className="font-medium"
                            >
                                Menú disponible
                            </Label>

                            <p className="text-sm text-muted-foreground">
                                {active
                                    ? 'El menú estará disponible.'
                                    : 'El menú no estará disponible.'}
                            </p>
                        </div>

                        <Switch
                            id="active"
                            checked={active}
                            onCheckedChange={setActive}
                        />

                        <input
                            type="hidden"
                            name="active"
                            value={active ? '1' : '0'}
                        />
                    </div>

                    {errors.active && (
                        <p className="text-sm text-destructive">
                            {errors.active}
                        </p>
                    )}

                    {/* Botón */}
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={processing}
                        >
                            {processing
                                ? 'Guardando...'
                                : submitLabel}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}