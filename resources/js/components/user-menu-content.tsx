import { Link, router } from '@inertiajs/react';
import {
    BadgeCheck,
    Bell,
    CreditCard,
    LogOut,
    Settings,
    Sparkles,
} from 'lucide-react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useSidebar } from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { User } from '@/types';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();
    const { setOpenMobile } = useSidebar();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuGroup>
                <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <UserInfo user={user} showEmail={true} />
                    </div>
                </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem>
                    <Sparkles className="mr-2 size-4" />
                    Actualizar a Pro
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem>
                    <BadgeCheck className="mr-2 size-4" />
                    Cuenta
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <CreditCard className="mr-2 size-4" />
                    Facturación
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Bell className="mr-2 size-4" />
                    Notificaciones
                </DropdownMenuItem>
                <DropdownMenuItem
                    nativeButton={false}
                    render={
                        <Link
                            className="block w-full cursor-pointer"
                            href={edit()}
                            prefetch
                            onClick={() => {
                                cleanup();
                                setOpenMobile(false);
                            }}
                        />
                    }
                >
                    <Settings className="mr-2 size-4" />
                    Configuración
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                nativeButton={true}
                render={
                    <Link
                        className="block w-full cursor-pointer"
                        href={logout()}
                        onClick={handleLogout}
                        data-test="logout-button"
                    />
                }
            >
                <LogOut className="mr-2 size-4" />
                Cerrar sesión
            </DropdownMenuItem>
        </>
    );
}
