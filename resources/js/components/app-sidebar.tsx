import {
    AudioWaveform,
    ChevronsUpDown,
    Command,
    GalleryVerticalEnd,
    Plus,
    ReceiptText,
} from 'lucide-react';
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
import { UtensilsCrossed } from 'lucide-react';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Categorías',
        href: index(),
        icon: GalleryVerticalEnd,
    },
    {
        title: 'Productos',
        href: products.index(),
        icon: AudioWaveform,
    },
    {
        title: 'Comandas',
        href: ordersIndex(),
        icon: UtensilsCrossed,
    },
    {
        title: 'Cuentas',
        href: billsIndex(),
        icon: ReceiptText,
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
                <NavMain groupLabel="Plataforma" items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
