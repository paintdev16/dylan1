import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { Button } from '@/components/ui/button';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

const tabs: {
    value: Appearance;
    icon: LucideIcon;
    activeClass: string;
    activeIconClass: string;
}[] = [
    {
        value: 'light',
        icon: Sun,
        activeClass: 'bg-background shadow-sm scale-100',
        activeIconClass: 'text-warning',
    },
    {
        value: 'system',
        icon: Monitor,
        activeClass: 'bg-background shadow-sm scale-100',
        activeIconClass: 'text-info',
    },
    {
        value: 'dark',
        icon: Moon,
        activeClass: 'bg-background shadow-sm scale-100',
        activeIconClass: 'text-primary',
    },
];

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <div
            className={cn(
                'inline-flex items-center gap-0.5 rounded-full border border-border/50 bg-muted/40 p-1 shadow-xs backdrop-blur-md',
                className,
            )}
            {...props}
        >
            {tabs.map(({ value, icon: Icon, activeClass, activeIconClass }) => (
                <Button
                    key={value}
                    variant="ghost"
                    aria-label={value}
                    onClick={() => updateAppearance(value)}
                    className={cn(
                        'relative h-7 w-7 scale-90 rounded-full text-muted-foreground transition-all duration-300 ease-out hover:bg-background/60 hover:text-foreground',
                        appearance === value && activeClass,
                    )}
                >
                    <Icon
                        className={cn(
                            'relative h-3.5 w-3.5 transition-colors duration-300',
                            appearance === value && activeIconClass,
                        )}
                    />
                </Button>
            ))}
        </div>
    );
}
