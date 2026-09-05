import {
    AudioWaveform,
    ClipboardList,
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
        title: 'Órdenes',
        href: ordersIndex(),
        icon: ClipboardList,
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
    const operationalTitles = [
        'Dashboard',
        'Mesas',
        'Órdenes',
        'Cocina',
        'Caja',
    ];
    const groupedTitles = new Set(operationalTitles);
    const operationalItems = visibleNavItems.filter((item) =>
        groupedTitles.has(item.title),
    );
    const groupedItems = (titles: string[]) =>
        visibleNavItems.filter((item) => titles.includes(item.title));

    return (
        <Sidebar
            collapsible="icon"
            variant="floating"
            className="[&_[data-slot=sidebar-inner]]:shadow-lg [&_[data-slot=sidebar-inner]]:shadow-primary/10"
        >
            <SidebarHeader className="border-b border-sidebar-border/70 bg-linear-to-br from-sidebar-primary/12 to-transparent">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <SidebarMenuButton
                                        size="lg"
                                        className="hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
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
                                className="w-(--anchor-width) min-w-56 rounded-lg border-sidebar-border bg-sidebar text-sidebar-foreground ring-sidebar-border"
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
                                    <DropdownMenuLabel className="text-xs text-sidebar-foreground/70">
                                        Equipos
                                    </DropdownMenuLabel>
                                    {teams.map((team) => {
                                        const Icon = team.icon;

                                        return (
                                            <DropdownMenuItem
                                                key={team.name}
                                                className={`gap-2 p-2 focus:bg-sidebar-accent focus:text-sidebar-accent-foreground ${
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
                                <DropdownMenuItem className="gap-2 p-2 focus:bg-sidebar-accent focus:text-sidebar-accent-foreground">
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
                <NavMain
                    groupLabel="Operaciones"
                    items={operationalItems}
                    groups={[
                        {
                            title: 'Menú',
                            icon: UtensilsCrossed,
                            items: groupedItems([
                                'Menú Diario',
                                'Productos',
                                'Categorías',
                            ]),
                        },
                        {
                            title: 'Inventario',
                            icon: Package,
                            items: groupedItems(['Inventario']),
                        },
                        {
                            title: 'Reportes',
                            icon: BarChart3,
                            items: groupedItems(['Reportes', 'Cuentas']),
                        },
                        {
                            title: 'Administración',
                            icon: Users,
                            items: groupedItems(['Usuarios']),
                        },
                    ].filter((group) => group.items.length > 0)}
                />
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/70 bg-sidebar-accent/30">
                <NavUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
