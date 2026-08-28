import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListOrdered, Tag } from 'lucide-react';
import { MenuCategory } from '@/types/restaurant';
import { CategoryStatusBadge } from './category-status-badge';
import { CategoryDialog } from './category-dialog';
import { CategoryDeleteDialog } from './category-delete-dialog';

type Props = {
    category: MenuCategory;
};

export function CategoryCard({ category }: Props) {
    return (
        <Card className="overflow-hidden transition-shadow hover:shadow-md">
            <CardHeader className="space-y-3">
                <div className="flex min-w-0 items-center justify-between gap-3">
                    <CardTitle className="flex min-w-0 items-center gap-2">
                        <Tag className="size-5 shrink-0 text-muted-foreground" />

                        <span className="truncate">{category.name}</span>
                    </CardTitle>
                    <CategoryStatusBadge active={category.active} />
                </div>
            </CardHeader>

            <CardContent>
                <div className="flex items-center justify-between gap-4 border-t pt-4">
                    {/* Orden de visualización */}
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                            <ListOrdered className="size-4 text-muted-foreground" />
                        </div>

                        <div className="min-w-0 space-y-0.5">
                            <p className="text-sm text-muted-foreground">
                                Orden de visualización
                            </p>

                            <p className="truncate font-medium">
                                {category.display_order}
                            </p>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex shrink-0 items-center gap-1">
                        <CategoryDialog category={category} />
                        <CategoryDeleteDialog category={category} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
