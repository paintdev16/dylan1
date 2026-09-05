import { Badge } from '@/components/ui/badge';
import { RestaurantTableStatus } from '@/types/restaurant';

type Props = {
    status: RestaurantTableStatus;
};

const statusConfig = {
    available: {
        label: 'Disponible',
        className: 'bg-success-soft text-success hover:bg-success-soft',
        dot: 'bg-success-soft',
    },
    occupied: {
        label: 'Ocupada',
        className:
            'bg-destructive-soft text-destructive hover:bg-destructive-soft',
        dot: 'bg-destructive-soft',
    },
    reserved: {
        label: 'Reservada',
        className: 'bg-info-soft text-info hover:bg-info-soft',
        dot: 'bg-info-soft',
    },
    out_of_service: {
        label: 'Fuera de servicio',
        className: 'bg-muted text-muted-foreground hover:bg-muted-foreground',
        dot: 'bg-muted',
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
