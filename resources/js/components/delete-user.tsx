import { Form } from '@inertiajs/react';
import { useRef } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Eliminar cuenta"
                description="Elimina permanentemente tu cuenta y todos sus accesos"
            />
            <div className="space-y-4 rounded-lg border border-destructive-border bg-destructive-soft p-4">
                <div className="relative space-y-0.5 text-destructive">
                    <p className="font-medium">Advertencia</p>
                    <p className="text-sm">
                        Procede con precaución, esta acción no se puede
                        deshacer.
                    </p>
                </div>

                <Dialog>
                    <DialogTrigger
                        render={
                            <Button
                                variant="destructive"
                                data-test="delete-user-button"
                            />
                        }
                    >
                        Eliminar cuenta
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>
                            ¿Estás seguro de que deseas eliminar tu cuenta?
                        </DialogTitle>
                        <DialogDescription>
                            Una vez que tu cuenta sea eliminada, todos sus datos
                            serán borrados permanentemente. Por favor, ingresa
                            tu contraseña para confirmar la eliminación
                            definitiva.
                        </DialogDescription>

                        <Form
                            {...ProfileController.destroy.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            onError={() => passwordInput.current?.focus()}
                            resetOnSuccess
                            className="space-y-6"
                        >
                            {({ resetAndClearErrors, processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="password"
                                            className="sr-only"
                                        >
                                            Contraseña
                                        </Label>

                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            ref={passwordInput}
                                            placeholder="Contraseña"
                                            autoComplete="current-password"
                                        />

                                        <InputError message={errors.password} />
                                    </div>

                                    <DialogFooter className="gap-2">
                                        <DialogClose
                                            render={
                                                <Button
                                                    variant="secondary"
                                                    onClick={() =>
                                                        resetAndClearErrors()
                                                    }
                                                />
                                            }
                                        >
                                            Cancelar
                                        </DialogClose>

                                        <Button
                                            variant="destructive"
                                            disabled={processing}
                                            type="submit"
                                            data-test="confirm-delete-user-button"
                                        >
                                            Eliminar cuenta
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
