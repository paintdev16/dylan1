import { Badge } from '@/components/ui/badge';
import { MenuCategory } from '@/types/restaurant';

type Props = {
    active: boolean;
};

const statusConfig = {
    active: {
        label: 'Disponible',
        className: 'bg-success-soft text-success hover:bg-success-soft',
        dot: 'bg-success-soft',
    },
    inactive: {
        label: 'No disponible',
        className:
            'bg-destructive-soft text-destructive hover:bg-destructive-soft',
        dot: 'bg-destructive-soft',
    },
};

export function CategoryStatusBadge({ active }: Props) {
    const config = statusConfig[active ? 'active' : 'inactive'];

    return (
        <Badge className={config.className}>
            <span className={`size-2 rounded-full ${config.dot}`} />
            {config.label}
        </Badge>
    );
}
