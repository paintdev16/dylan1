<?php

namespace Database\Seeders;

use App\Models\Bill;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Seeder;

class PaymentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cashier = User::query()->firstOrFail();

        // 1. Pago de cuenta cerrada (para llevar)
        $closedBill = Bill::query()->where('status', 'closed')->first();
        if ($closedBill) {
            Payment::updateOrCreate(
                [
                    'bill_id' => $closedBill->id,
                    'receipt_number' => 'B001-00001',
                ],
                [
                    'cashier_id' => $cashier->id,
                    'payment_method' => 'efectivo',
                    'amount' => 35.00,
                ]
            );
        }

        // 2. Pago parcial para mesa en atención
        $openBill = Bill::query()->where('status', 'open')->orderBy('id')->first();
        if ($openBill) {
            Payment::updateOrCreate(
                [
                    'bill_id' => $openBill->id,
                    'receipt_number' => 'YAPE-88291',
                ],
                [
                    'cashier_id' => $cashier->id,
                    'payment_method' => 'yape',
                    'amount' => 20.00,
                ]
            );
        }
    }
}
