<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // 1. Roles, Permisos y Usuarios
            RolesPermissionsSeeder::class,
            UserTableSeeder::class,

            // 2. Infraestructura y Mesas
            RestaurantTableSeeder::class,

            // 3. Catálogo de Menú, Productos y Stock
            MenuCategoriesSeeder::class,
            MenuSubcategoriesSeeder::class,
            MenuSubcategoryTypesSeeder::class,
            ProductsSeeder::class,
            ProductStocksSeeder::class,
            ProductStockMovementsSeeder::class,

            // 4. Planificación Diaria (Menú del Día y Modalidades)
            DailyMenusSeeder::class,
            DailyMenuProductsSeeder::class,
            MenuModalitiesSeeder::class,
            MenuModalityItemsSeeder::class,

            // 5. Operación en Vivo (Cuentas, Comandas, Ítems y Pagos)
            BillsSeeder::class,
            OrdersSeeder::class,
            OrderItemsSeeder::class,
            OrderItemMenuProductsSeeder::class,
            PaymentsSeeder::class,
        ]);
    }
}
