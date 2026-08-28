import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Table2, UserCheck, Users, Utensils } from 'lucide-react';
import { RestaurantTable } from '@/types/restaurant';
import { TableDeleteDialog } from './table-delete-dialog';
import { TableDialog } from './table-dialog';
import { TableOpenSessionDialog } from './table-open-session-dialog';
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
    const isAvailable = table.status === 'available';
    const isOccupied = table.status === 'occupied';
    const activeSession = table.active_session;

    return (
        <Card className={`overflow-hidden transition-shadow hover:shadow-md ${isOccupied ? 'border-amber-300 dark:border-amber-800/60 bg-amber-50/10' : ''}`}>
            <CardHeader className="space-y-3 pb-3">
                {/* Mesa Header */}
                <div className="flex min-w-0 items-center justify-between gap-3">
                    <CardTitle className="flex min-w-0 items-center gap-2">
                        <Table2 className={`size-5 shrink-0 ${isOccupied ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`} />
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
                        <span>Capacidad: <strong className="text-foreground">{table.capacity} personas</strong></span>
                    </div>

                    {!isOccupied && (
                        <div className="flex shrink-0 items-center gap-1">
                            <TableDialog table={table} />
                            <TableDeleteDialog table={table} />
                        </div>
                    )}
                </div>

                {/* Si la mesa está disponible */}
                {isAvailable && (
                    <div className="pt-1">
                        <TableOpenSessionDialog table={table} />
                    </div>
                )}

                {/* Si la mesa está ocupada (Sesión activa) */}
                {isOccupied && activeSession && (
                    <div className="rounded-lg border bg-background/80 p-2.5 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-1">
                                <UserCheck className="size-3.5 text-primary" />
                                Mozo:
                            </span>
                            <span className="font-semibold text-foreground">
                                {activeSession.waiter?.name ?? 'Sin asignar'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-1">
                                <Users className="size-3.5 text-primary" />
                                Comensales:
                            </span>
                            <span className="font-semibold text-foreground">
                                {activeSession.customer_count} personas
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-1">
                                <Clock className="size-3.5 text-primary" />
                                Abierta a las:
                            </span>
                            <span className="font-medium text-muted-foreground">
                                {formatTime(activeSession.opened_at)}
                            </span>
                        </div>

                        <div className="pt-1">
                            <Button asChild size="sm" variant="outline" className="w-full text-xs gap-1.5 border-primary/30 hover:bg-primary/5 text-primary">
                                <Link href="/orders">
                                    <Utensils className="size-3.5" />
                                    Gestionar Comandas / Pedidos
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
