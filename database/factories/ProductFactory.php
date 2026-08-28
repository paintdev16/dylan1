<?php

namespace Database\Factories;

use App\Models\MenuCategory;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'menu_category_id' => MenuCategory::query()->firstOrCreate(
                ['name' => 'Comidas'],
                ['display_order' => 1, 'active' => true]
            )->id,
            'menu_subcategory_id' => null,
            'menu_subcategory_type_id' => null,
            'name' => fake()->unique()->words(3, true),
            'description' => null,
            'presentation' => null,
            'price' => fake()->randomFloat(2, 5, 100),
            'image' => null,
            'type' => 'simple',
            'status' => 'activo',
        ];
    }

    public function beverage(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'simple',
        ]);
    }

    public function prepared(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'prepared',
        ]);
    }

    public function soldOut(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactivo',
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactivo',
        ]);
    }
}
