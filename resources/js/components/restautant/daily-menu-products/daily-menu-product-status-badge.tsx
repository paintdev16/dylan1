import { Badge } from '@/components/ui/badge';
import { RestaurantTableStatus } from '@/types/restaurant';

type Props = {
    status: RestaurantTableStatus;
};

const statusConfig = {
    available: {
        label: 'Disponible',
        className:
            'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
        dot: 'bg-emerald-500',
    },
    occupied: {
        label: 'Ocupada',
        className:
            'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400',
        dot: 'bg-red-500',
    },
    reserved: {
        label: 'Reservada',
        className:
            'bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
        dot: 'bg-blue-500',
    },
    out_of_service: {
        label: 'Fuera de servicio',
        className:
            'bg-gray-100 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400',
        dot: 'bg-gray-500',
    },
};

export function TableStatusBadge({ status }: Props) {
    const config = statusConfig[status];

    return (
        <Badge className={config.className}>
            <span className={`size-2 rounded-full ${config.dot}`} />
            {config.label}
        </Badge>
    );
}
