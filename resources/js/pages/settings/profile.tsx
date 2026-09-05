import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    KeyRound,
    LockKeyhole,
    Mail,
    ShieldCheck,
    UserRound,
} from 'lucide-react';
import { useRef } from 'react';
import { useState } from 'react';

import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import ManagePasskeys from '@/components/manage-passkeys';
import ManageTwoFactor from '@/components/manage-two-factor';
import PasswordInput from '@/components/password-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { edit as editProfile } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { Auth, Passkey } from '@/types';
import { RadioGroup } from '@base-ui/react';

type Props = {
    mustVerifyEmail: boolean;
    status?: string;
    canDeleteAccount?: boolean;
    passwordRules: string;
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
    canManagePasskeys?: boolean;
    passkeys?: Passkey[];
};

type PageProps = { auth: Auth };

function SectionCard({
    id,
    icon: Icon,
    eyebrow,
    title,
    description,
    children,
}: {
    id: string;
    icon: typeof UserRound;
    eyebrow: string;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <section
            id={id}
            className="scroll-mt-6 overflow-hidden rounded-3xl border border-primary/15 bg-card shadow-sm"
        >
            <div className="flex items-start gap-4 border-b border-border/70 bg-primary-soft/35 p-5 sm:p-6">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                    <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                        {eyebrow}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold tracking-tight">
                        {title}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>
            <div className="p-5 sm:p-6">{children}</div>
        </section>
    );
}

export default function Profile({
    mustVerifyEmail,
    status,
    canDeleteAccount = true,
    passwordRules,
    canManageTwoFactor,
    requiresConfirmation,
    twoFactorEnabled,
    canManagePasskeys,
    passkeys,
}: Props) {
    const { auth } = usePage<PageProps>().props;
    const isMobile = useIsMobile();
    const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
    const [passwordDrawerOpen, setPasswordDrawerOpen] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const initials = auth.user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    const primaryRole = auth.user.roles?.[0] ?? 'Usuario';
    const isEmailVerified = auth.user.email_verified_at !== null;

    return (
        <>
            <Head title="Mi cuenta" />
            <div className="mx-auto max-w-5xl space-y-6 pb-8">
                <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary p-6 text-primary-foreground shadow-lg sm:p-8">
                    <div className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-white/15 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-32 left-1/3 size-72 rounded-full bg-black/10 blur-3xl" />
                    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex size-20 shrink-0 items-center justify-center rounded-3xl bg-primary-foreground/15 text-2xl font-bold ring-1 ring-primary-foreground/25">
                                {initials}
                            </div>
                            <div>
                                <p className="text-sm text-primary-foreground/75">
                                    Cuenta personal
                                </p>
                                <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                                    {auth.user.name}
                                </h1>
                                <p className="mt-1 text-sm text-primary-foreground/80">
                                    {auth.user.email}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Badge className="border-primary-foreground/25 bg-primary-foreground/15 text-primary-foreground">
                                {primaryRole}
                            </Badge>
                            <Badge className="border-primary-foreground/25 bg-primary-foreground/15 text-primary-foreground">
                                {isEmailVerified
                                    ? 'Correo verificado'
                                    : 'Pendiente'}
                            </Badge>
                        </div>
                    </div>
                </div>

                <nav
                    aria-label="Secciones de cuenta"
                    className="flex gap-2 overflow-x-auto rounded-2xl border border-primary/15 bg-card p-2 shadow-sm"
                >
                    {[
                        ['profile', 'Perfil'],
                        ['password', 'Contraseña'],
                        ['security', 'Seguridad'],
                    ].map(([href, label]) => (
                        <a
                            key={href}
                            href={`#${href}`}
                            className="shrink-0 rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary-soft hover:text-primary"
                        >
                            {label}
                        </a>
                    ))}
                </nav>

                <SectionCard
                    id="profile"
                    icon={UserRound}
                    eyebrow="Información personal"
                    title="Perfil de usuario"
                    description="Mantén actualizados tus datos de contacto."
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="grid gap-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <UserRound className="size-4 text-primary" />
                                {auth.user.name}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="size-4 text-primary" />
                                {auth.user.email}
                            </div>
                        </div>
                        <Drawer
                            open={profileDrawerOpen}
                            onOpenChange={setProfileDrawerOpen}
                            showSwipeHandle={isMobile}
                            swipeDirection={isMobile ? 'down' : 'right'}
                        >
                            <DrawerTrigger
                                render={
                                    <Button type="button" variant="outline">
                                        Editar perfil
                                    </Button>
                                }
                            />
                            <DrawerContent>
                                <DrawerHeader className="p-4">
                                    <DrawerTitle>Editar perfil</DrawerTitle>
                                    <DrawerDescription>
                                        Actualiza tu nombre y correo
                                        electrónico.
                                    </DrawerDescription>
                                </DrawerHeader>

                                <div className="flex-1 scroll-fade overflow-y-auto p-4">
                                    <Form
                                        id="profile-form"
                                        {...ProfileController.update.form()}
                                        options={{ preserveScroll: true }}
                                        onSuccess={() =>
                                            setProfileDrawerOpen(false)
                                        }
                                        className="space-y-5"
                                    >
                                        {({ processing, errors }) => (
                                            <>
                                                <div className="grid gap-5">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="name">
                                                            Nombre completo
                                                        </Label>

                                                        <Input
                                                            id="name"
                                                            name="name"
                                                            defaultValue={
                                                                auth.user.name
                                                            }
                                                            required
                                                            autoComplete="name"
                                                            placeholder="Tu nombre completo"
                                                        />

                                                        <InputError
                                                            message={
                                                                errors.name
                                                            }
                                                        />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="email">
                                                            Correo electrónico
                                                        </Label>

                                                        <div className="relative">
                                                            <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

                                                            <Input
                                                                id="email"
                                                                name="email"
                                                                type="email"
                                                                defaultValue={
                                                                    auth.user
                                                                        .email
                                                                }
                                                                required
                                                                autoComplete="username"
                                                                placeholder="correo@ejemplo.com"
                                                                className="pl-9"
                                                            />
                                                        </div>

                                                        <InputError
                                                            message={
                                                                errors.email
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                {mustVerifyEmail &&
                                                    !isEmailVerified && (
                                                        <div className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning-soft p-4 text-sm">
                                                            <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning" />

                                                            <div>
                                                                <p className="font-medium text-warning-foreground-soft">
                                                                    Tu correo
                                                                    todavía no
                                                                    está
                                                                    verificado.
                                                                </p>

                                                                <Link
                                                                    href={send()}
                                                                    as="button"
                                                                    className="mt-1 text-warning-foreground-soft underline underline-offset-4"
                                                                >
                                                                    Reenviar
                                                                    correo de
                                                                    verificación
                                                                </Link>

                                                                {status ===
                                                                    'verification-link-sent' && (
                                                                    <p className="mt-2 font-medium text-success">
                                                                        Se envió
                                                                        un nuevo
                                                                        enlace
                                                                        de
                                                                        verificación.
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                {isEmailVerified && (
                                                    <div className="flex items-center gap-2 text-sm text-success">
                                                        <CheckCircle2 className="size-4" />
                                                        Correo electrónico
                                                        verificado
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </Form>
                                </div>

                                <DrawerFooter className="grid grid-cols-2 gap-2 border-t p-4">
                                    <DrawerClose
                                        render={
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full"
                                            >
                                                Cancelar
                                            </Button>
                                        }
                                    />

                                    <Button
                                        type="submit"
                                        form="profile-form"
                                        className="w-full"
                                    >
                                        Guardar cambios
                                    </Button>
                                </DrawerFooter>
                            </DrawerContent>
                        </Drawer>
                    </div>
                </SectionCard>

                <SectionCard
                    id="password"
                    icon={LockKeyhole}
                    eyebrow="Acceso"
                    title="Cambiar contraseña"
                    description="Usa una contraseña única y difícil de adivinar."
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <LockKeyhole className="size-5 text-primary" />
                            <span>
                                Tu contraseña se utiliza para proteger el acceso
                                a tu cuenta.
                            </span>
                        </div>
                        <>
                            <Drawer
                                open={passwordDrawerOpen}
                                onOpenChange={setPasswordDrawerOpen}
                                showSwipeHandle={isMobile}
                                swipeDirection={isMobile ? 'down' : 'right'}
                            >
                                <DrawerTrigger
                                    render={
                                        <Button type="button" variant="outline">
                                            Cambiar contraseña
                                        </Button>
                                    }
                                />
                                <DrawerContent>
                                    <DrawerHeader className="p-4">
                                        <DrawerTitle>
                                            Cambiar contraseña
                                        </DrawerTitle>
                                        <DrawerDescription>
                                            Confirma tu contraseña actual para
                                            establecer una nueva.
                                        </DrawerDescription>
                                    </DrawerHeader>
                                    <div className="flex-1 scroll-fade overflow-y-auto p-4">
                                        <Form
                                            id="password-form"
                                            {...SecurityController.update.form()}
                                            options={{ preserveScroll: true }}
                                            resetOnError={[
                                                'password',
                                                'password_confirmation',
                                                'current_password',
                                            ]}
                                            resetOnSuccess
                                            onSuccess={() =>
                                                setPasswordDrawerOpen(false)
                                            }
                                            onError={(errors) => {
                                                if (errors.password)
                                                    passwordInput.current?.focus();
                                                if (errors.current_password)
                                                    currentPasswordInput.current?.focus();
                                            }}
                                            className="space-y-5"
                                        >
                                            {({ errors }) => (
                                                <>
                                                    <div className="grid gap-5">
                                                        <div className="grid gap-2">
                                                            <Label htmlFor="current_password">
                                                                Contraseña
                                                                actual
                                                            </Label>
                                                            <PasswordInput
                                                                id="current_password"
                                                                ref={
                                                                    currentPasswordInput
                                                                }
                                                                name="current_password"
                                                                autoComplete="current-password"
                                                                placeholder="Contraseña actual"
                                                            />
                                                            <InputError
                                                                message={
                                                                    errors.current_password
                                                                }
                                                            />
                                                        </div>
                                                        <div className="grid gap-2">
                                                            <Label htmlFor="password">
                                                                Nueva contraseña
                                                            </Label>
                                                            <PasswordInput
                                                                id="password"
                                                                ref={
                                                                    passwordInput
                                                                }
                                                                name="password"
                                                                autoComplete="new-password"
                                                                placeholder="Nueva contraseña"
                                                                passwordrules={
                                                                    passwordRules
                                                                }
                                                            />
                                                            <InputError
                                                                message={
                                                                    errors.password
                                                                }
                                                            />
                                                        </div>
                                                        <div className="grid gap-2">
                                                            <Label htmlFor="password_confirmation">
                                                                Confirmar
                                                                contraseña
                                                            </Label>
                                                            <PasswordInput
                                                                id="password_confirmation"
                                                                name="password_confirmation"
                                                                autoComplete="new-password"
                                                                placeholder="Repite la contraseña"
                                                                passwordrules={
                                                                    passwordRules
                                                                }
                                                            />
                                                            <InputError
                                                                message={
                                                                    errors.password_confirmation
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </Form>
                                    </div>
                                <DrawerFooter className="grid grid-cols-2 gap-2 border-t p-4">
                                        <Button
                                            type="submit"
                                            form="password-form"
                                            className="h-[34px]"
                                            data-test="update-password-button"
                                        >
                                            Actualizar contraseña
                                        </Button>
                                        <DrawerClose
                                            render={
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                >
                                                    Cancelar
                                                </Button>
                                            }
                                        />
                                    </DrawerFooter>
                                </DrawerContent>
                            </Drawer>
                        </>
                    </div>
                </SectionCard>

                <SectionCard
                    id="security"
                    icon={ShieldCheck}
                    eyebrow="Protección avanzada"
                    title="Seguridad de la cuenta"
                    description="Administra métodos adicionales para proteger tu acceso."
                >
                    <div className="space-y-6">
                        <div className="flex items-start gap-3 rounded-2xl border border-success/25 bg-success-soft/50 p-4">
                            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" />
                            <div>
                                <p className="font-medium">
                                    Tu cuenta está protegida
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Activa 2FA o una passkey para añadir una
                                    capa extra de seguridad.
                                </p>
                            </div>
                        </div>
                        <div className="grid gap-6 xl:grid-cols-2">
                            <div className="rounded-2xl border border-border/80 p-4 sm:p-5">
                                <ManageTwoFactor
                                    canManageTwoFactor={canManageTwoFactor}
                                    requiresConfirmation={requiresConfirmation}
                                    twoFactorEnabled={twoFactorEnabled}
                                />
                            </div>
                            <div className="rounded-2xl border border-border/80 p-4 sm:p-5">
                                <ManagePasskeys
                                    canManagePasskeys={canManagePasskeys}
                                    passkeys={passkeys}
                                />
                            </div>
                        </div>
                    </div>
                </SectionCard>

                {canDeleteAccount && (
                    <section className="rounded-3xl border border-destructive-border bg-destructive-soft/60 p-5 sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <KeyRound className="mt-0.5 size-5 shrink-0 text-destructive" />
                                <div>
                                    <h2 className="font-semibold text-destructive">
                                        Zona de riesgo
                                    </h2>
                                    <p className="mt-1 text-sm text-destructive/80">
                                        Elimina tu cuenta permanentemente
                                        después de confirmar tu contraseña.
                                    </p>
                                </div>
                            </div>
                            <DeleteUser />
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}

Profile.layout = { breadcrumbs: [{ title: 'Mi cuenta', href: editProfile() }] };
