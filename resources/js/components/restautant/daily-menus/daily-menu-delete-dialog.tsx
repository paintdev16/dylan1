import { Form } from '@inertiajs/react';
import { AlertTriangle, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { DailyMenu } from '@/types/restaurant';
import { destroy } from '@/routes/daily-menus';

type Props = {
    dailyMenu: DailyMenu;
};

export function DailyMenuDeleteDialog({ dailyMenu }: Props) {
    return (
        <AlertDialog>
            <AlertDialogTrigger
                render={
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Eliminar menú del ${dailyMenu.formatted_date}`}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                }
            />

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="size-5 text-destructive" />
                        ¿Eliminar el menú del día?
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        <div className="space-y-3">
                            <p>
                                Estás a punto de eliminar el menú del{' '}
                                <strong>{dailyMenu.formatted_date}</strong>.
                            </p>

                            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                                <p className="font-medium text-destructive">
                                    Esta acción eliminará permanentemente:
                                </p>

                                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                                    <li>
                                        Los productos asociados a este menú.
                                    </li>
                                    <li>
                                        Las configuraciones de modalidades de
                                        esos productos.
                                    </li>
                                </ul>
                            </div>

                            <p className="font-medium">
                                Esta acción no se puede deshacer.
                            </p>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <AlertDialogCancel className="w-full sm:w-auto">
                        Cancelar
                    </AlertDialogCancel>

                    <Form
                        action={destroy(dailyMenu.id)}
                        method="delete"
                        className="w-full sm:w-auto"
                    >
                        {({ processing }) => (
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={processing}
                                className="w-full sm:w-auto"
                            >
                                {processing
                                    ? 'Eliminando...'
                                    : 'Sí, eliminar menú'}
                            </Button>
                        )}
                    </Form>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
