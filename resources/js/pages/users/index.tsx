import { Head, router, useForm } from '@inertiajs/react';
import {
    KeyRound,
    Pencil,
    Plus,
    Search,
    ShieldCheck,
    Trash2,
    UsersIcon,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useInitials } from '@/hooks/use-initials';
import { destroy, index, store, update } from '@/routes/users';
import type { User } from '@/types';

type Props = {
    users: User[];
    roles: Array<{
        name: string;
        permissions: string[];
    }>;
    filters: {
        search: string;
        role: string;
    };
    pagination: {
        current_page: number;
        last_page: number;
        total: number;
    };
};

type UserForm = {
    name: string;
    email: string;
    password: string;
    role: string;
};

export default function Index({
    users: userList,
    roles,
    filters,
    pagination,
}: Props) {
    const getInitials = useInitials();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
    const [search, setSearch] = useState(filters.search);
    const [roleFilter, setRoleFilter] = useState(filters.role);

    const {
        data,
        setData,
        post,
        put,
        delete: deleteForm,
        errors,
        processing,
        reset,
    } = useForm<UserForm>({
        name: '',
        email: '',
        password: '',
        role: '',
    });

    useEffect(() => {
        if (!dialogOpen) {
            setEditingUser(null);
            reset();
        }
    }, [dialogOpen, reset]);

    const openCreate = () => {
        setEditingUser(null);
        reset();
        setDialogOpen(true);
    };

    const openEdit = (user: User) => {
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.roles?.[0] ?? '',
        });
        setDialogOpen(true);
    };

    const submit = () => {
        if (editingUser) {
            put(update.url(editingUser.id), {
                preserveScroll: true,
                onSuccess: () => setDialogOpen(false),
            });

            return;
        }

        post(store.url(), {
            preserveScroll: true,
            onSuccess: () => setDialogOpen(false),
        });
    };

    const confirmDelete = () => {
        if (!deleteTarget) {
            return;
        }

        deleteForm(destroy.url(deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    };

    const applyFilters = () => {
        router.get(
            index.url(),
            {
                search: search || undefined,
                role: roleFilter || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setRoleFilter('');
        router.get(index.url(), {}, { replace: true });
    };

    const selectedRole = roles.find((role) => role.name === data.role);

    return (
        <>
            <Head title="Usuarios" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Usuarios
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {pagination.total} usuarios registrados en el
                            sistema
                        </p>
                    </div>
                    <Button onClick={openCreate} data-test="create-user-button">
                        <Plus className="mr-1.5 size-4" />
                        Nuevo
                    </Button>
                </div>

                <div className="grid gap-3 rounded-xl border border-primary/15 bg-card p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_14rem_auto]">
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    applyFilters();
                                }
                            }}
                            placeholder="Buscar por nombre o correo"
                            className="pl-9"
                        />
                    </div>
                    <Select
                        value={roleFilter || 'all'}
                        onValueChange={(value) =>
                            setRoleFilter(value === 'all' ? '' : (value ?? ''))
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Todos los roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los roles</SelectItem>
                            {roles.map((role) => (
                                <SelectItem key={role.name} value={role.name}>
                                    {role.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                        <Button onClick={applyFilters} className="flex-1">
                            Filtrar
                        </Button>
                        {(filters.search || filters.role) && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={clearFilters}
                                aria-label="Limpiar filtros"
                            >
                                <X className="size-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {userList.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
                        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary-soft">
                            <UsersIcon className="size-8 text-primary" />
                        </div>
                        <div className="text-center">
                            <p className="text-base font-medium text-foreground">
                                No se encontraron usuarios
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                No hay usuarios registrados en el sistema
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {userList.map((user) => (
                            <div
                                key={user.id}
                                className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-primary/15 bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-sm font-semibold text-primary">
                                        {getInitials(user.name)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-foreground">
                                            {user.name}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            type="button"
                                            onClick={() => openEdit(user)}
                                            aria-label="Editar"
                                            className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                        >
                                            <Pencil className="size-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setDeleteTarget(user)
                                            }
                                            aria-label="Eliminar"
                                            className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {user.email_verified_at ? (
                                        <span className="inline-flex items-center rounded-md border border-card-success-border bg-card-success/40 px-1.5 py-0.5 text-[10px] font-medium text-success-foreground-soft">
                                            Verificado
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-md border border-card-warning-border bg-card-warning/40 px-1.5 py-0.5 text-[10px] font-medium text-warning-foreground-soft">
                                            Pendiente
                                        </span>
                                    )}
                                    {user.roles?.map((role) => (
                                        <span
                                            key={role}
                                            className="inline-flex items-center rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground-soft"
                                        >
                                            {role}
                                        </span>
                                    ))}
                                    <span className="inline-flex items-center gap-1 rounded-md border border-primary/15 bg-primary-soft px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                        <KeyRound className="size-3" />
                                        {user.permissions?.length ?? 0} permisos
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {pagination.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.current_page <= 1}
                            onClick={() =>
                                router.get(
                                    index.url(),
                                    {
                                        page: pagination.current_page - 1,
                                        search: filters.search || undefined,
                                        role: filters.role || undefined,
                                    },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                )
                            }
                        >
                            Anterior
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Página {pagination.current_page} de{' '}
                            {pagination.last_page}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={
                                pagination.current_page >= pagination.last_page
                            }
                            onClick={() =>
                                router.get(
                                    index.url(),
                                    {
                                        page: pagination.current_page + 1,
                                        search: filters.search || undefined,
                                        role: filters.role || undefined,
                                    },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                )
                            }
                        >
                            Siguiente
                        </Button>
                    </div>
                )}
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingUser ? 'Editar usuario' : 'Crear usuario'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingUser
                                ? 'Modifica los datos del usuario.'
                                : 'Rellena los campos para crear un nuevo usuario.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="user-name">Nombre</Label>
                            <Input
                                id="user-name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="Nombre completo"
                                autoComplete="off"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="user-email">Email</Label>
                            <Input
                                id="user-email"
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                placeholder="correo@ejemplo.com"
                                autoComplete="off"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="user-password">
                                {editingUser
                                    ? 'Nueva contraseña (dejar vacío para mantener)'
                                    : 'Contraseña'}
                            </Label>
                            <Input
                                id="user-password"
                                type="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                placeholder={
                                    editingUser
                                        ? 'Sin cambios'
                                        : 'Mínimo 8 caracteres'
                                }
                                autoComplete="new-password"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Rol</Label>
                            <Select
                                value={data.role}
                                onValueChange={(value) =>
                                    setData('role', value ?? '')
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecciona un rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem
                                            key={role.name}
                                            value={role.name}
                                        >
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.role} />
                        </div>

                        {selectedRole && (
                            <div className="rounded-xl border border-primary/15 bg-primary-soft/50 p-3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                                    <ShieldCheck className="size-4" />
                                    Permisos incluidos
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {selectedRole.permissions.map(
                                        (permission) => (
                                            <span
                                                key={permission}
                                                className="rounded-md bg-card px-2 py-1 text-xs text-muted-foreground shadow-xs"
                                            >
                                                {permission}
                                            </span>
                                        ),
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                            disabled={processing}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={submit} disabled={processing}>
                            {processing
                                ? 'Guardando...'
                                : editingUser
                                  ? 'Guardar cambios'
                                  : 'Crear usuario'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={deleteTarget !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteTarget(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Eliminar usuario</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de eliminar a{' '}
                            <strong>{deleteTarget?.name ?? ''}</strong>? Esta
                            acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                            disabled={processing}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={processing}
                        >
                            {processing ? 'Eliminando...' : 'Eliminar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Usuarios',
            href: index(),
        },
    ],
};
