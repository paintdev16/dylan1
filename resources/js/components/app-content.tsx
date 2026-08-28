import * as React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

type Props = React.ComponentProps<'main'>;

export function AppContent({ children, className, ...props }: Props) {
    return (
        <SidebarInset
            className={cn(
                'mx-auto flex h-svh max-h-svh min-h-0 w-full max-w-7xl flex-1 flex-col rounded-xl md:peer-data-[variant=inset]:h-[calc(100svh-1rem)] md:peer-data-[variant=inset]:max-h-[calc(100svh-1rem)]',
                className,
            )}
            {...props}
        >
            {children}
        </SidebarInset>
    );
}
