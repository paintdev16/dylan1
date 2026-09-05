import { Link, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Table2, UserCheck, Users, Utensils } from 'lucide-react';
import { index as ordersIndex } from '@/routes/orders';
import { RestaurantTable } from '@/types/restaurant';
import { Auth } from '@/types';
import { TableDialog } from './table-dialog';
import { TableStatusDialog } from './table-status-dialog';
import { TableStatusBadge } from './table-status-badge';

type Props = {
    table: RestaurantTable;
};

function formatTime(dateString?: string): string {
    if (!dateString) return '';
    return new Intl.DateTimeFormat('es-PE', {
        timeStyle: 'short',
        timeZone: 'America/Lima',
    }).format(new Date(dateString));
}

export function TableCard({ table }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const isAvailable = table.status === 'available';
    const isOccupied = table.status === 'occupied';
    const isOutOfService = table.status === 'out_of_service';
    const isSuperAdmin = auth.user.roles?.includes('super-admin') ?? false;
    const activeSession = table.active_session;

    return (
        <Card
            className={`overflow-hidden border hover:shadow-md ${isOccupied ? 'border-card-warning-border bg-warning-soft' : isAvailable ? 'border-card-success-border bg-success-soft' : 'border-destructive/25 bg-destructive-soft'}`}
        >
            <CardHeader className="space-y-3 pb-3">
                {/* Mesa Header */}
                <div className="flex min-w-0 items-center justify-between gap-3">
                    <CardTitle className="flex min-w-0 items-center gap-2">
                        <Table2
                            className={`size-5 shrink-0 ${isOccupied ? 'text-warning' : isAvailable ? 'text-success' : 'text-destructive'}`}
                        />
                        <span className="truncate">Mesa {table.number}</span>
                    </CardTitle>
                    <TableStatusBadge status={table.status} />
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Info básica / Capacidad */}
                <div className="flex items-center justify-between gap-4 border-t pt-3">
                    <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                        <Users className="size-4 shrink-0" />
                        <span>
                            Capacidad:{' '}
                            <strong className="text-foreground">
                                {table.capacity} personas
                            </strong>
                        </span>
                    </div>

                    {!isOccupied && (
                        <div className="flex shrink-0 items-center gap-1">
                            <TableDialog table={table} />
                            {isAvailable && (
                                <TableStatusDialog
                                    table={table}
                                    status="out_of_service"
                                />
                            )}
                            {isOutOfService && isSuperAdmin && (
                                <TableStatusDialog
                                    table={table}
                                    status="available"
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* La apertura se realiza junto con el primer pedido. */}
                {isAvailable && (
                    <div className="pt-1">
                        <Button
                            asChild
                            size="sm"
                            className="w-full gap-1.5 text-xs"
                        >
                            <Link href={ordersIndex()}>
                                <Utensils className="size-3.5" />
                                Abrir con primera comanda
                            </Link>
                        </Button>
                    </div>
                )}

                {/* Si la mesa está ocupada (Sesión activa) */}
                {isOccupied && activeSession && (
                    <div className="space-y-2 rounded-lg border bg-background/80 p-2.5 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-muted-foreground">
                                <UserCheck className="size-3.5 text-primary" />
                                Mozo:
                            </span>
                            <span className="font-semibold text-foreground">
                                {activeSession.waiter?.name ?? 'Sin asignar'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-muted-foreground">
                                <Users className="size-3.5 text-primary" />
                                Comensales:
                            </span>
                            <span className="font-semibold text-foreground">
                                {activeSession.customer_count} personas
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="size-3.5 text-primary" />
                                Abierta a las:
                            </span>
                            <span className="font-medium text-muted-foreground">
                                {formatTime(activeSession.opened_at)}
                            </span>
                        </div>

                        <div className="pt-1">
                            <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="w-full gap-1.5 border-primary/30 text-xs text-primary hover:bg-primary/5"
                            >
                                <Link href={ordersIndex()}>
                                    <Utensils className="size-3.5" />
                                    Gestionar Órdenes / Pedidos
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
