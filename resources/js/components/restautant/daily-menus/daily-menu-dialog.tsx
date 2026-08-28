import { useState } from 'react';
import { Pencil, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

import { DailyMenu } from '@/types/restaurant';
import { DailyMenuForm } from './daily-menu-form';
import { store, update } from '@/routes/daily-menus';

type Props = {
    dailyMenu?: DailyMenu;
};

export function DailyMenuDialog({ dailyMenu }: Props) {
    const [open, setOpen] = useState(false);

    const isEditing = !!dailyMenu;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    isEditing ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            title="Editar menú"
                        >
                            <Pencil className="size-4" />
                        </Button>
                    ) : (
                        <Button>
                            <Plus className="size-4" />
                            Crear menú
                        </Button>
                    )
                }
            />

            <DialogContent className="max-h-[92vh] w-[95vw] max-w-xl! overflow-y-auto p-6 sm:p-8">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing
                            ? 'Editar menú del día'
                            : 'Crear menú del día'}
                    </DialogTitle>
                </DialogHeader>

                <DailyMenuForm
                    dailyMenu={dailyMenu}
                    action={
                        isEditing
                            ? update(dailyMenu.id)
                            : store()
                    }
                    method={isEditing ? 'put' : 'post'}
                    submitLabel={
                        isEditing
                            ? 'Actualizar menú'
                            : 'Crear menú'
                    }
                    onSuccess={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}