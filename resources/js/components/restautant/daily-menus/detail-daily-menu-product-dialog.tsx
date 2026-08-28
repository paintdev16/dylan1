import { useState } from 'react';
import { CalendarDays, ChevronDown, Package } from 'lucide-react';

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

import { DailyMenu } from '@/types/restaurant';

type Props = {
    dailyMenu: DailyMenu;
    children: React.ReactElement;
};

export function DetailDailyMenuProductsDialog({ dailyMenu, children }: Props) {
    const products = dailyMenu.products ?? [];

    const [openProductId, setOpenProductId] = useState<number | null>(null);

    const handleOpenChange = (productId: number, open: boolean) => {
        setOpenProductId(open ? productId : null);
    };

    return (
        <Dialog>
            <DialogTrigger render={children} />

            <DialogContent className="max-h-[92vh] w-[95vw] max-w-3xl! overflow-y-auto p-6 sm:p-8">
                {' '}
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Package className="size-6" />
                        Productos del menú
                    </DialogTitle>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="size-4" />
                        <span>Menú del {dailyMenu.formatted_date}</span>
                    </div>
                </DialogHeader>
                <div className="space-y-3">
                    {products.map((product) => {
                        const isOpen = openProductId === product.id;

                        return (
                            <Collapsible
                                key={product.id}
                                open={isOpen}
                                onOpenChange={(open) =>
                                    handleOpenChange(product.id, open)
                                }
                            >
                                <div className="overflow-hidden rounded-lg border">
                                    <CollapsibleTrigger className="w-full">
                                        <div className="flex items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-muted/50">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                    <Package className="size-5 text-muted-foreground" />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold">
                                                        {product.product_name}
                                                    </p>

                                                    <p className="text-sm text-muted-foreground">
                                                        {
                                                            product.quantity_available
                                                        }{' '}
                                                        disponibles
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 items-center gap-4">
                                                <div className="text-right">
                                                    <p className="font-semibold">
                                                        S/{' '}
                                                        {Number(
                                                            product.price,
                                                        ).toFixed(2)}
                                                    </p>

                                                    <p
                                                        className={
                                                            product.active
                                                                ? 'text-xs font-medium text-emerald-600'
                                                                : 'text-xs font-medium text-muted-foreground'
                                                        }
                                                    >
                                                        {product.active
                                                            ? 'Activo'
                                                            : 'Inactivo'}
                                                    </p>
                                                </div>

                                                <ChevronDown
                                                    className={`size-5 text-muted-foreground transition-transform ${
                                                        isOpen
                                                            ? 'rotate-180'
                                                            : ''
                                                    }`}
                                                />
                                            </div>
                                        </div>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent>
                                        <div className="border-t bg-muted/20 p-4">
                                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground">
                                                        Producto
                                                    </p>

                                                    <p className="mt-1 font-medium">
                                                        {product.product_name}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground">
                                                        Precio
                                                    </p>

                                                    <p className="mt-1 font-medium">
                                                        S/{' '}
                                                        {Number(
                                                            product.price,
                                                        ).toFixed(2)}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground">
                                                        Cantidad disponible
                                                    </p>

                                                    <p className="mt-1 font-medium">
                                                        {
                                                            product.quantity_available
                                                        }
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground">
                                                        Orden de visualización
                                                    </p>

                                                    <p className="mt-1 font-medium">
                                                        {product.display_order}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground">
                                                        ID del registro
                                                    </p>

                                                    <p className="mt-1 font-medium">
                                                        #{product.id}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground">
                                                        ID del producto
                                                    </p>

                                                    <p className="mt-1 font-medium">
                                                        #{product.product_id}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground">
                                                        Estado
                                                    </p>

                                                    <p
                                                        className={
                                                            product.active
                                                                ? 'mt-1 font-medium text-emerald-600'
                                                                : 'mt-1 font-medium text-muted-foreground'
                                                        }
                                                    >
                                                        {product.active
                                                            ? 'Activo'
                                                            : 'Inactivo'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CollapsibleContent>
                                </div>
                            </Collapsible>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}
