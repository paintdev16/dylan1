<?php

namespace Database\Seeders;

use App\Models\DailyMenu;
use App\Models\DailyMenuProduct;
use App\Models\MenuModality;
use App\Models\MenuModalityItem;
use Illuminate\Database\Seeder;

class MenuModalityItemsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Obtener menú del día
        |--------------------------------------------------------------------------
        */

        $dailyMenu = DailyMenu::where('date', today())
            ->firstOrFail();

        /*
        |--------------------------------------------------------------------------
        | Obtener modalidades
        |--------------------------------------------------------------------------
        */

        $menuCompleto = MenuModality::where(
            'daily_menu_id',
            $dailyMenu->id
        )
            ->where('name', 'Menú completo')
            ->firstOrFail();

        $soloSegundo = MenuModality::where(
            'daily_menu_id',
            $dailyMenu->id
        )
            ->where('name', 'Solo segundo')
            ->firstOrFail();

        $entradaPostre = MenuModality::where(
            'daily_menu_id',
            $dailyMenu->id
        )
            ->where('name', 'Entrada + postre')
            ->firstOrFail();

        /*
        |--------------------------------------------------------------------------
        | Obtener productos del menú del día
        |--------------------------------------------------------------------------
        |
        | Estos registros vienen de daily_menu_products.
        |
        */

        $ajiDeGallina = $this->getDailyMenuProduct(
            $dailyMenu->id,
            'Ají de Gallina'
        );

        $secoDePollo = $this->getDailyMenuProduct(
            $dailyMenu->id,
            'Seco de Pollo'
        );

        $causaRellena = $this->getDailyMenuProduct(
            $dailyMenu->id,
            'Causa Rellena'
        );

        $arrozConLeche = $this->getDailyMenuProduct(
            $dailyMenu->id,
            'Arroz con Leche'
        );

        /*
        |--------------------------------------------------------------------------
        | Modalidad: Menú completo
        |--------------------------------------------------------------------------
        |
        | Segundo + entrada + postre
        |
        */

        $this->createItem(
            $menuCompleto,
            $ajiDeGallina,
            'main_course'
        );

        $this->createItem(
            $menuCompleto,
            $causaRellena,
            'starter'
        );

        $this->createItem(
            $menuCompleto,
            $arrozConLeche,
            'dessert'
        );

        /*
        |--------------------------------------------------------------------------
        | Modalidad: Solo segundo
        |--------------------------------------------------------------------------
        |
        | Solo segundo
        |
        */

        $this->createItem(
            $soloSegundo,
            $ajiDeGallina,
            'main_course'
        );

        /*
        |--------------------------------------------------------------------------
        | Modalidad: Entrada + postre
        |--------------------------------------------------------------------------
        |
        | Entrada + postre
        |
        */

        $this->createItem(
            $entradaPostre,
            $causaRellena,
            'starter'
        );

        $this->createItem(
            $entradaPostre,
            $arrozConLeche,
            'dessert'
        );
    }

    /**
     * Obtener un producto publicado en el menú del día.
     */
    private function getDailyMenuProduct(
        int $dailyMenuId,
        string $productName
    ): DailyMenuProduct {
        return DailyMenuProduct::where(
            'daily_menu_id',
            $dailyMenuId
        )
            ->whereHas('product', function ($query) use ($productName) {
                $query->where('name', $productName);
            })
            ->firstOrFail();
    }

    /**
     * Crear o actualizar un componente de la modalidad.
     */
    private function createItem(
        MenuModality $modality,
        DailyMenuProduct $dailyMenuProduct,
        string $itemType
    ): void {
        MenuModalityItem::updateOrCreate(
            [
                'menu_modality_id' => $modality->id,
                'daily_menu_product_id' => $dailyMenuProduct->id,
                'item_type' => $itemType,
            ],
            [
                'quantity' => 1,
            ]
        );
    }
}
