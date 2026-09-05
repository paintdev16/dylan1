import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { toUrl } from '@/lib/utils';
import type { NavItem } from '@/types';
import type { LucideIcon } from 'lucide-react';

export function NavMain({
    items = [],
    groupLabel = 'Platform',
    groups = [],
}: {
    items: NavItem[];
    groupLabel?: string;
    groups?: { title: string; icon: LucideIcon; items: NavItem[] }[];
}) {
    const { isCurrentUrl } = useCurrentUrl();
    const { setOpenMobile } = useSidebar();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel className="font-semibold tracking-wider text-sidebar-primary/80 uppercase">
                {groupLabel}
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            render={<Link href={toUrl(item.href)} prefetch />}
                            isActive={isCurrentUrl(item.href)}
                            tooltip={{ children: item.title }}
                            onClick={() => setOpenMobile(false)}
                            className="font-medium data-active:bg-sidebar-primary data-active:text-sidebar-primary-foreground data-active:shadow-md data-active:shadow-sidebar-primary/20 [&>svg]:text-sidebar-foreground/70 hover:[&>svg]:text-sidebar-primary data-active:[&>svg]:text-sidebar-primary-foreground"
                        >
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
                {groups.map((group) => (
                    <NavGroup key={group.title} {...group} />
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}

function NavGroup({
    title,
    icon: Icon,
    items,
}: {
    title: string;
    icon: LucideIcon;
    items: NavItem[];
}) {
    const { isCurrentUrl } = useCurrentUrl();
    const { setOpenMobile, state, isMobile } = useSidebar();
    const [open, setOpen] = useState(
        items.some((item) => isCurrentUrl(item.href)),
    );
    const isGroupActive = items.some((item) => isCurrentUrl(item.href));
    const collapsedDesktop = state === 'collapsed' && !isMobile;

    const groupItems = items.map((item) => (
        <DropdownMenuItem
            key={item.title}
            render={<Link href={toUrl(item.href)} prefetch />}
            onClick={() => setOpenMobile(false)}
            className={`text-sidebar-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground [&>svg]:text-sidebar-foreground/70 ${
                isCurrentUrl(item.href)
                    ? 'bg-sidebar-primary font-semibold text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground focus:bg-sidebar-primary focus:text-sidebar-primary-foreground [&>svg]:text-sidebar-primary-foreground'
                    : ''
            }`}
        >
            {item.icon && <item.icon />}
            <span>{item.title}</span>
        </DropdownMenuItem>
    ));

    if (collapsedDesktop) {
        return (
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <SidebarMenuButton
                                tooltip={{ children: title }}
                                isActive={isGroupActive}
                                className="font-medium data-active:bg-sidebar-primary data-active:text-sidebar-primary-foreground data-active:shadow-md data-active:shadow-sidebar-primary/20 [&>svg]:text-sidebar-foreground/70 hover:[&>svg]:text-sidebar-primary data-active:[&>svg]:text-sidebar-primary-foreground"
                            >
                                <Icon />
                                <span>{title}</span>
                            </SidebarMenuButton>
                        }
                    />
                    <DropdownMenuContent
                        side="right"
                        align="start"
                        className="min-w-52 border-sidebar-border bg-sidebar text-sidebar-foreground ring-sidebar-border"
                    >
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-sidebar-foreground/70">
                                {title}
                            </DropdownMenuLabel>
                            {groupItems}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        );
    }

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                render={
                    <button
                        type="button"
                        onClick={() => setOpen((value) => !value)}
                    />
                }
                isActive={isGroupActive}
                tooltip={{ children: title }}
                className="font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-sidebar-primary data-active:text-sidebar-primary-foreground [&>svg]:text-sidebar-foreground/70 hover:[&>svg]:text-sidebar-primary data-active:[&>svg]:text-sidebar-primary-foreground"
            >
                <Icon />
                <span>{title}</span>
                <ChevronRight
                    className={`ml-auto transition-transform group-data-[collapsible=icon]:hidden ${open ? 'rotate-90' : ''}`}
                />
            </SidebarMenuButton>
            {open && (
                <SidebarMenu className="ml-3 border-sidebar-border pl-2 group-data-[collapsible=icon]:hidden">
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                render={
                                    <Link href={toUrl(item.href)} prefetch />
                                }
                                isActive={isCurrentUrl(item.href)}
                                tooltip={{ children: item.title }}
                                onClick={() => setOpenMobile(false)}
                                className="font-medium data-active:bg-sidebar-primary data-active:font-semibold data-active:text-sidebar-primary-foreground data-active:shadow-sm [&>svg]:text-sidebar-foreground/70 data-active:[&>svg]:text-sidebar-primary-foreground"
                            >
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            )}
        </SidebarMenuItem>
    );
}
