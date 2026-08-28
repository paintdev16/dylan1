import { Badge } from '@/components/ui/badge';
import { MenuCategory } from '@/types/restaurant';

type Props = {
    active: boolean;
};

const statusConfig = {
    active: {
        label: 'Disponible',
        className:
            'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
        dot: 'bg-emerald-500',
    },
    inactive: {
        label: 'No disponible',
        className:
            'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400',
        dot: 'bg-red-500',
    },
};

export function CategoryStatusBadge({ active }: Props) {
    const config = statusConfig[active?'active':'inactive'];

    return (
        <Badge className={config.className}>
            <span className={`size-2 rounded-full ${config.dot}`} />
            {config.label}
        </Badge>
    );
}
