import { Head } from '@inertiajs/react';
import { RestaurantTable } from '@/types/restaurant';
import { index } from '@/routes/tables';
import { PageHeader } from '@/components/page-header';
import { TableCard } from '@/components/restautant/restaurant-tables/table-card';
import { TableDialog } from '@/components/restautant/restaurant-tables/table-dialog';
type Props = {
    restaurantTables: RestaurantTable[];
};

export default function Index({ restaurantTables }: Props) {
    return (
        <>
            <Head title="Mesas" />

            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <PageHeader
                        title="Mesas"
                        description="Administra y consulta el estado de las mesas del restaurante."
                    />

                    <TableDialog />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {restaurantTables.map((table) => (
                        <TableCard key={table.id} table={table} />
                    ))}
                </div>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Mesas',
            href: index(),
        },
    ],
};
