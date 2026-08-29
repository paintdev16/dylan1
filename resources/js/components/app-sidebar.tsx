import {
    AudioWaveform,
    ChevronsUpDown,
    CircleDollarSign,
    Command,
    GalleryVerticalEnd,
    Package,
    Plus,
    ReceiptText,
    BarChart3,
    Users,
} from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { LayoutGrid } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import { index } from '@/routes/menu-categories';
import { index as billsIndex } from '@/routes/bills';
import { index as ordersIndex } from '@/routes/orders';
import products from '@/routes/products';
import { ChefHat, Table2, UtensilsCrossed } from 'lucide-react';
import { index as tablesIndex } from '@/routes/tables';
import { index as dailyMenuIndex } from '@/routes/daily-menu';
import { index as kitchenIndex } from '@/routes/kitchen';
import { index as cashRegisterIndex } from '@/routes/cash-register';
import { index as reportsIndex } from '@/routes/reports';
import type { User } from '@/types';

type RestaurantNavItem = NavItem & { roles: string[] };

const mainNavItems: RestaurantNavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        roles: ['super-admin', 'admin', 'mozo', 'cocina', 'cajero'],
    },
    {
        title: 'Mesas',
        href: tablesIndex(),
        icon: Table2,
        roles: ['super-admin', 'admin', 'mozo'],
    },
    {
        title: 'Menú Diario',
        href: dailyMenuIndex(),
        icon: UtensilsCrossed,
        roles: ['super-admin', 'admin'],
    },
    {
        title: 'Comandas',
        href: ordersIndex(),
        icon: UtensilsCrossed,
        roles: ['super-admin', 'admin', 'mozo'],
    },
    {
        title: 'Cocina',
        href: kitchenIndex(),
        icon: ChefHat,
        roles: ['super-admin', 'admin', 'cocina'],
    },
    {
        title: 'Caja',
        href: cashRegisterIndex(),
        icon: CircleDollarSign,
        roles: ['super-admin', 'admin', 'cajero'],
    },
    {
        title: 'Cuentas',
        href: billsIndex(),
        icon: ReceiptText,
        roles: ['super-admin', 'admin', 'mozo', 'cajero'],
    },
    {
        title: 'Categorías',
        href: index(),
        icon: GalleryVerticalEnd,
        roles: ['super-admin', 'admin'],
    },
    {
        title: 'Productos',
        href: products.index(),
        icon: AudioWaveform,
        roles: ['super-admin', 'admin'],
    },
    {
        title: 'Inventario',
        href: '/product-stock',
        icon: Package,
        roles: ['super-admin', 'admin'],
    },
    {
        title: 'Usuarios',
        href: '/users',
        icon: Users,
        roles: ['super-admin', 'admin'],
    },
    {
        title: 'Reportes',
        href: reportsIndex(),
        icon: BarChart3,
        roles: ['super-admin', 'admin'],
    },
];

const teams = [
    {
        name: 'Acme Inc',
        plan: 'Empresa',
        icon: GalleryVerticalEnd,
        shortcut: '⌘1',
    },
    {
        name: 'Acme Corp.',
        plan: 'Startup',
        icon: AudioWaveform,
        shortcut: '⌘2',
    },
    { name: 'Evil Corp.', plan: 'Gratis', icon: Command, shortcut: '⌘3' },
];

export function AppSidebar() {
    const sidebar = useSidebar();
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const userRoles = auth.user.roles ?? [];
    const visibleNavItems = mainNavItems.filter((item) =>
        item.roles.some((role) => userRoles.includes(role)),
    );

    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <SidebarMenuButton
                                        size="lg"
                                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                    />
                                }
                            >
                                <AppLogo />
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        Acme Inc
                                    </span>
                                    <span className="truncate text-xs">
                                        Empresa
                                    </span>
                                </div>
                                <ChevronsUpDown className="ml-auto" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-(--anchor-width) min-w-56 rounded-lg"
                                side={
                                    sidebar.state === 'collapsed' &&
                                    !sidebar.isMobile
                                        ? 'left'
                                        : 'bottom'
                                }
                                align="start"
                                sideOffset={4}
                            >
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                                        Equipos
                                    </DropdownMenuLabel>
                                    {teams.map((team) => {
                                        const Icon = team.icon;

                                        return (
                                            <DropdownMenuItem
                                                key={team.name}
                                                className={`gap-2 p-2 ${
                                                    team.name === 'Acme Inc'
                                                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                                        : ''
                                                }`}
                                            >
                                                <div className="flex size-6 items-center justify-center rounded-md border border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground">
                                                    <Icon className="size-4 shrink-0" />
                                                </div>
                                                {team.name}
                                                <DropdownMenuShortcut>
                                                    {team.shortcut}
                                                </DropdownMenuShortcut>
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="gap-2 p-2">
                                    <div className="flex size-6 items-center justify-center rounded-md border border-sidebar-border bg-sidebar text-sidebar-foreground">
                                        <Plus className="size-4" />
                                    </div>
                                    <span className="font-medium text-muted-foreground">
                                        Añadir equipo
                                    </span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groupLabel="Plataforma" items={visibleNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
