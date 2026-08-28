<?php

namespace Database\Seeders;

use App\Models\MenuCategory;
use App\Models\MenuSubcategory;
use App\Models\MenuSubcategoryType;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Categorías
        |--------------------------------------------------------------------------
        */

        $comidas = MenuCategory::where('name', 'Comidas')
            ->firstOrFail();

        $bebidas = MenuCategory::where('name', 'Bebidas')
            ->firstOrFail();

        /*
        |--------------------------------------------------------------------------
        | Subcategorías de Comidas
        |--------------------------------------------------------------------------
        |
        | Actualmente Comidas solamente tiene:
        |
        | - Menú Económico
        | - Platos Especiales
        |
        */

        $menuEconomico = MenuSubcategory::where(
            'menu_category_id',
            $comidas->id
        )
            ->where('name', 'Menú Económico')
            ->firstOrFail();

        $platosEspeciales = MenuSubcategory::where(
            'menu_category_id',
            $comidas->id
        )
            ->where('name', 'Platos Especiales')
            ->firstOrFail();

        $segundos = MenuSubcategoryType::where(
            'menu_subcategory_id',
            $menuEconomico->id
        )
            ->where('name', 'Segundos')
            ->firstOrFail();

        $entradas = MenuSubcategoryType::where(
            'menu_subcategory_id',
            $menuEconomico->id
        )
            ->where('name', 'Entradas')
            ->firstOrFail();

        $postres = MenuSubcategoryType::where(
            'menu_subcategory_id',
            $menuEconomico->id
        )
            ->where('name', 'Postres')
            ->firstOrFail();

        /*
        |--------------------------------------------------------------------------
        | Productos
        |--------------------------------------------------------------------------
        */

        $products = [

            /*
            |--------------------------------------------------------------------------
            | SEGUNDOS - MENÚ ECONÓMICO
            |--------------------------------------------------------------------------
            |
            | Estos productos representan el segundo del menú económico.
            |
            | Ejemplo:
            |
            | Ají de Gallina = S/7
            | Seco de Pollo  = S/7
            |
            */

            [
                'menu_category_id' => $comidas->id,
                'menu_subcategory_id' => $menuEconomico->id,
                'menu_subcategory_type_id' => $segundos->id,
                'name' => 'Ají de Gallina',
                'description' => 'Ají de gallina acompañado de arroz y papa.',
                'presentation' => null,
                'price' => 7.00,
                'image' => null,
                'type' => 'prepared',
                'status' => 'activo',
            ],

            [
                'menu_category_id' => $comidas->id,
                'menu_subcategory_id' => $menuEconomico->id,
                'menu_subcategory_type_id' => $segundos->id,
                'name' => 'Seco de Pollo',
                'description' => 'Seco de pollo acompañado de arroz y frejoles.',
                'presentation' => null,
                'price' => 7.00,
                'image' => null,
                'type' => 'prepared',
                'status' => 'activo',
            ],

            [
                'menu_category_id' => $comidas->id,
                'menu_subcategory_id' => $menuEconomico->id,
                'menu_subcategory_type_id' => $segundos->id,
                'name' => 'Estofado de Pollo',
                'description' => 'Estofado de pollo acompañado de arroz y papa.',
                'presentation' => null,
                'price' => 7.00,
                'image' => null,
                'type' => 'prepared',
                'status' => 'activo',
            ],

            [
                'menu_category_id' => $comidas->id,
                'menu_subcategory_id' => $menuEconomico->id,
                'menu_subcategory_type_id' => $segundos->id,
                'name' => 'Arroz con Pollo',
                'description' => 'Arroz con pollo acompañado de ensalada.',
                'presentation' => null,
                'price' => 7.00,
                'image' => null,
                'type' => 'prepared',
                'status' => 'activo',
            ],

            /*
            |--------------------------------------------------------------------------
            | ENTRADAS DEL MENÚ ECONÓMICO
            |--------------------------------------------------------------------------
            |
            | Las entradas pertenecen al menú económico.
            |
            | Su precio individual es S/4.
            |
            | No creamos una subcategoría "Entradas".
            |
            */

            [
                'menu_category_id' => $comidas->id,
                'menu_subcategory_id' => $menuEconomico->id,
                'menu_subcategory_type_id' => $entradas->id,
                'name' => 'Causa Rellena',
                'description' => 'Causa de papa amarilla rellena de pollo.',
                'presentation' => null,
                'price' => 4.00,
                'image' => null,
                'type' => 'prepared',
                'status' => 'activo',
            ],

            [
                'menu_category_id' => $comidas->id,
                'menu_subcategory_id' => $menuEconomico->id,
                'menu_subcategory_type_id' => $entradas->id,
                'name' => 'Papa a la Huancaína',
                'description' => 'Papa sancochada acompañada de salsa huancaína.',
                'presentation' => null,
                'price' => 4.00,
                'image' => null,
                'type' => 'prepared',
                'status' => 'activo',
            ],

            [
                'menu_category_id' => $comidas->id,
                'menu_subcategory_id' => $menuEconomico->id,
                'menu_subcategory_type_id' => $entradas->id,
                'name' => 'Anticuchos',
                'description' => 'Anticuchos de corazón acompañados de papa y choclo.',
                'presentation' => null,
                'price' => 4.00,
                'image' => null,
                'type' => 'prepared',
                'status' => 'activo',
            ],

            /*
            |--------------------------------------------------------------------------
            | POSTRES DEL MENÚ ECONÓMICO
            |--------------------------------------------------------------------------
            |
            | Los postres también pertenecen al menú económico.
            |
            | Su precio individual es S/3.
            |
            */

            [
                'menu_category_id' => $comidas->id,
                'menu_subcategory_id' => $menuEconomico->id,
                'menu_subcategory_type_id' => $postres->id,
                'name' => 'Arroz con Leche',
                'description' => 'Tradicional arroz con leche peruano.',
                'presentation' => null,
                'price' => 3.00,
                'image' => null,
                'type' => 'prepared',
                'status' => 'activo',
            ],

            [
                'menu_category_id' => $comidas->id,
                'menu_subcategory_id' => $menuEconomico->id,
                'menu_subcategory_type_id' => $postres->id,
                'name' => 'Mazamorra Morada',
                'description' => 'Mazamorra morada tradicional.',
                'presentation' => null,
                'price' => 3.00,
                'image' => null,
                'type' => 'prepared',
                'status' => 'activo',
            ],

            [
                'menu_category_id' => $comidas->id,
                'menu_subcategory_id' => $menuEconomico->id,
                'menu_subcategory_type_id' => $postres->id,
                'name' => 'Flan',
                'description' => 'Flan casero con caramelo.',
                'presentation' => null,
                'price' => 3.00,
                'image' => null,
                'type' => 'prepared',
                'status' => 'activo',
            ],

            /*
            |--------------------------------------------------------------------------
            | PLATOS ESPECIALES
            |--------------------------------------------------------------------------
            |
            | Estos NO forman parte del menú económico.
            |
            */

            [
                'menu_category_id' => $comidas->id,
                'menu_subcategory_id' => $platosEspeciales->id,
                'name' => 'Bistec a lo Pobre',
                'description' => 'Bistec acompañado de huevo, plátano, arroz y papas fritas.',
                'presentation' => null,
                'price' => 18.00,
                'image' => null,
                'type' => 'prepared',
                'status' => 'activo',
            ],

            [
                'menu_category_id' => $comidas->id,
                'menu_subcategory_id' => $platosEspeciales->id,
                'name' => 'Chancho a la Caja China',
                'description' => 'Chancho preparado en caja china acompañado de papas y ensalada.',
                'presentation' => null,
                'price' => 22.00,
                'image' => null,
                'type' => 'prepared',
                'status' => 'activo',
            ],

            [
                'menu_category_id' => $comidas->id,
                'menu_subcategory_id' => $platosEspeciales->id,
                'name' => 'Lomo Saltado',
                'description' => 'Lomo de res salteado con cebolla, tomate y papas fritas.',
                'presentation' => null,
                'price' => 18.00,
                'image' => null,
                'type' => 'prepared',
                'status' => 'activo',
            ],

            [
                'menu_category_id' => $comidas->id,
                'menu_subcategory_id' => $platosEspeciales->id,
                'name' => 'Pollo a la Brasa',
                'description' => 'Pollo a la brasa acompañado de papas fritas.',
                'presentation' => null,
                'price' => 16.00,
                'image' => null,
                'type' => 'prepared',
                'status' => 'activo',
            ],

            [
                'menu_category_id' => $comidas->id,
                'menu_subcategory_id' => $platosEspeciales->id,
                'name' => 'Ceviche de Pescado',
                'description' => 'Ceviche de pescado fresco al estilo peruano.',
                'presentation' => null,
                'price' => 20.00,
                'image' => null,
                'type' => 'prepared',
                'status' => 'activo',
            ],

            [
                'menu_category_id' => $comidas->id,
                'menu_subcategory_id' => $platosEspeciales->id,
                'name' => 'Tacu Tacu con Lomo',
                'description' => 'Tacu tacu acompañado de lomo saltado.',
                'presentation' => null,
                'price' => 19.00,
                'image' => null,
                'type' => 'prepared',
                'status' => 'activo',
            ],

            [
                'menu_category_id' => $comidas->id,
                'menu_subcategory_id' => $platosEspeciales->id,
                'name' => 'Arroz Chaufa',
                'description' => 'Arroz chaufa al estilo peruano.',
                'presentation' => null,
                'price' => 14.00,
                'image' => null,
                'type' => 'prepared',
                'status' => 'activo',
            ],

            /*
            |--------------------------------------------------------------------------
            | BEBIDAS
            |--------------------------------------------------------------------------
            */

            [
                'menu_category_id' => $bebidas->id,
                'menu_subcategory_id' => null,
                'name' => 'Coca-Cola',
                'description' => 'Gaseosa Coca-Cola.',
                'presentation' => '1L',
                'price' => 8.00,
                'image' => null,
                'type' => 'simple',
                'status' => 'activo',
            ],

            [
                'menu_category_id' => $bebidas->id,
                'menu_subcategory_id' => null,
                'name' => 'Pepsi',
                'description' => 'Gaseosa Pepsi.',
                'presentation' => '1L',
                'price' => 7.00,
                'image' => null,
                'type' => 'simple',
                'status' => 'activo',
            ],

            [
                'menu_category_id' => $bebidas->id,
                'menu_subcategory_id' => null,
                'name' => 'Inca Kola',
                'description' => 'Gaseosa Inca Kola.',
                'presentation' => '1L',
                'price' => 8.00,
                'image' => null,
                'type' => 'simple',
                'status' => 'activo',
            ],

            [
                'menu_category_id' => $bebidas->id,
                'menu_subcategory_id' => null,
                'name' => 'Agua Mineral',
                'description' => 'Agua mineral.',
                'presentation' => '625ml',
                'price' => 3.00,
                'image' => null,
                'type' => 'simple',
                'status' => 'activo',
            ],
        ];

        /*
        |--------------------------------------------------------------------------
        | Guardar / actualizar
        |--------------------------------------------------------------------------
        */

        foreach ($products as $product) {
            Product::updateOrCreate(
                [
                    'name' => $product['name'],
                    'menu_category_id' => $product['menu_category_id'],
                ],
                $product
            );
        }
    }
}
