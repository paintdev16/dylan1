import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table2, Users } from 'lucide-react';
import { Product, RestaurantTable } from '@/types/restaurant';
import { TableDeleteDialog } from './table-delete-dialog';
import { TableDialog } from './table-dialog';
import { TableStatusBadge } from './table-status-badge';

type Props = {
    table: RestaurantTable;
};

export function TableCard({ table }: Props) {

    return (
        <Card
            className={`overflow-hidden transition-shadow hover:shadow-md`}
        >
            <CardHeader className="space-y-3">
                {/* Mesa */}
                <div className="flex min-w-0 items-center justify-between gap-3">
                    <CardTitle className="flex min-w-0 items-center gap-2">
                        <Table2 className="size-5 shrink-0 text-muted-foreground" />

                        <span className="truncate">Mesa {table.number}</span>
                    </CardTitle>
                    <TableStatusBadge status={table.status} />

                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between gap-4 border-t pt-4">
                    {/* Capacidad */}
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                            <Users className="size-4 text-muted-foreground" />
                        </div>

                        <div className="min-w-0 space-y-0.5">
                            <p className="text-sm text-muted-foreground">
                                Capacidad
                            </p>

                            <p className="truncate font-medium">
                                {table.capacity}
                            </p>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex shrink-0 items-center gap-1">
                        <TableDialog table={table} />
                        <TableDeleteDialog table={table} />

                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
