import { Head } from '@inertiajs/react';
import { MenuCategory } from '@/types/restaurant';
import { PageHeader } from '@/components/page-header';
import { index } from '@/routes/menu-categories';
import { CategoryCard } from '@/components/restautant/menu-categories/category-card';
import { CategoryDialog } from '@/components/restautant/menu-categories/category-dialog';
import { Tags } from 'lucide-react';
type Props = {
    menuCategories: MenuCategory[];
};

export default function Index({ menuCategories }: Props) {
    return (
        <>
            <Head title="Categorías de Menú" />

            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <PageHeader
                        title="Categorías de Menú"
                        description="Administra y consulta las categorías del menú."
                    />

                    <CategoryDialog />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {menuCategories.map((category) => (
                        <CategoryCard key={category.id} category={category} />
                    ))}

                    {menuCategories.length === 0 && (
                        <div className="col-span-full flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-card-primary-border bg-card-primary text-center">
                            <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-card/70 text-primary shadow-sm dark:bg-primary dark:text-primary-foreground">
                                <Tags className="size-5" />
                            </div>
                            <p className="font-medium">
                                No hay categorías registradas
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Crea una categoría para organizar el menú.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Categorías de Menú',
            href: index(),
        },
    ],
};
