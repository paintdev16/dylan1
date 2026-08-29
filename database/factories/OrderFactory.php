<?php

namespace Database\Factories;

use App\Models\Bill;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'bill_id' => function (): int {
                $user = User::factory()->create();

                return Bill::create([
                    'opening_waiter_id' => $user->id,
                    'order_type' => 'takeout',
                    'status' => 'open',
                    'opened_at' => now(),
                ])->id;
            },
            'user_id' => User::factory(),
            'status' => fake()->randomElement([
                'pending',
                'sent_to_kitchen',
                'completed',
            ]),
        ];
    }
}
