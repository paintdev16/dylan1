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

import {
    DailyMenu,
    DailyMenuProduct,
    MenuSubcategory,
    Product,
} from '@/types/restaurant';

import { store, update } from '@/routes/daily-menu-products';

import { DailyMenuProductForm } from './daily-menu-product-form';

type Props = {
    dailyMenuProduct?: DailyMenuProduct;
    products: Product[];
    dailyMenu: DailyMenu;
    menuSubcategories: MenuSubcategory[];
};

export function DailyMenuProductDialog({
    dailyMenuProduct,
    products,
    dailyMenu,
    menuSubcategories,
}: Props) {
    const [open, setOpen] = useState(false);

    const isEditing = !!dailyMenuProduct;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    isEditing ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-primary hover:bg-primary/10 hover:text-primary"
                        >
                            <Pencil className="size-4" />
                        </Button>
                    ) : (
                        <Button>
                            <Plus className="size-4" />
                            Agregar producto
                        </Button>
                    )
                }
            />

            <DialogContent className="max-h-[92vh] w-[95vw] max-w-xl! overflow-y-auto p-6 sm:p-8">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing
                            ? 'Editar producto del menú'
                            : 'Agregar producto al menú'}
                    </DialogTitle>
                </DialogHeader>

                <DailyMenuProductForm
                    dailyMenuProduct={dailyMenuProduct}
                    products={products}
                    menuSubcategories={menuSubcategories}
                    dailyMenu={dailyMenu}
                    action={isEditing ? update(dailyMenuProduct.id) : store()}
                    method={isEditing ? 'put' : 'post'}
                    submitLabel={isEditing ? 'Actualizar' : 'Agregar producto'}
                    onSuccess={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
