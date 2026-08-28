import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Pencil, Plus } from 'lucide-react';
import { MenuCategory } from '@/types/restaurant';
import { CategoryForm } from './category-form';
import { store, update } from '@/routes/menu-categories';

type Props = {
    category?: MenuCategory;
};

export function CategoryDialog({ category }: Props) {
    const [open, setOpen] = useState(false);

    const isEditing = !!category;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    isEditing ? (
                        <Button variant="ghost" size="icon">
                            <Pencil className="size-4" />
                        </Button>
                    ) : (
                        <Button>
                            <Plus className="size-4" />
                            Crear categoría
                        </Button>
                    )
                }
            />

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Editar categoría' : 'Crear categoría'}
                    </DialogTitle>
                </DialogHeader>

                <CategoryForm
                    category={category}
                    action={isEditing ? update(category.id) : store()}
                    method={isEditing ? 'put' : 'post'}
                    submitLabel={
                        isEditing ? 'Actualizar categoría' : 'Crear categoría'
                    }
                    onSuccess={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
