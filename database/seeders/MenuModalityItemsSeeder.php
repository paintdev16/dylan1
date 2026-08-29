<?php

namespace Database\Seeders;

use App\Models\DailyMenu;
use App\Models\DailyMenuProduct;
use App\Models\MenuModality;
use App\Models\MenuModalityItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class MenuModalityItemsSeeder extends Seeder
{
    /** @var array<string, list<string>> */
    private const COMPONENT_TYPES_BY_MODALITY = [
        'full_menu' => ['main_course', 'starter', 'dessert'],
        'main_only' => ['main_course'],
        'starter_dessert' => ['starter', 'dessert'],
    ];

    public function run(): void
    {
        $dailyMenu = DailyMenu::query()
            ->whereDate('date', now('America/Lima')->toDateString())
            ->where('active', true)
            ->firstOrFail();

        $dailyMenuProducts = DailyMenuProduct::query()
            ->with('product.menuSubcategoryType')
            ->where('daily_menu_id', $dailyMenu->id)
            ->where('active', true)
            ->get();

        $modalities = MenuModality::query()
            ->where('daily_menu_id', $dailyMenu->id)
            ->whereIn('code', array_keys(self::COMPONENT_TYPES_BY_MODALITY))
            ->get()
            ->keyBy('code');

        foreach (self::COMPONENT_TYPES_BY_MODALITY as $modalityCode => $componentTypes) {
            $modality = $modalities->get($modalityCode);

            if (! $modality) {
                continue;
            }

            $this->synchronizeItems($modality, $dailyMenuProducts, $componentTypes);
        }
    }

    /**
     * @param  Collection<int, DailyMenuProduct>  $dailyMenuProducts
     * @param  list<string>  $componentTypes
     */
    private function synchronizeItems(
        MenuModality $modality,
        Collection $dailyMenuProducts,
        array $componentTypes
    ): void {
        $eligibleProducts = $dailyMenuProducts->filter(
            fn (DailyMenuProduct $dailyMenuProduct): bool => in_array(
                $dailyMenuProduct->product?->menuSubcategoryType?->code,
                $componentTypes,
                true
            )
        );

        $eligibleProductIds = $eligibleProducts->pluck('id');

        $modality->items()
            ->when(
                $eligibleProductIds->isNotEmpty(),
                fn ($query) => $query->whereNotIn('daily_menu_product_id', $eligibleProductIds),
                fn ($query) => $query
            )
            ->delete();

        foreach ($eligibleProducts as $dailyMenuProduct) {
            MenuModalityItem::updateOrCreate(
                [
                    'menu_modality_id' => $modality->id,
                    'daily_menu_product_id' => $dailyMenuProduct->id,
                ],
                [
                    'item_type' => $dailyMenuProduct->product->menuSubcategoryType->code,
                    'quantity' => 1,
                ]
            );
        }
    }
}
