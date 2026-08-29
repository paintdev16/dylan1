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
                    'payment_method' => 'cash',
                ],
                [
                    'cashier_id' => $cashier->id,
                    'amount' => 35.00,
                    'receipt_number' => $this->receiptNumberFor($closedBill),
                ]
            );
        }

        // 2. Pago parcial para mesa en atención
        $openBill = Bill::query()->where('status', 'open')->orderBy('id')->first();
        if ($openBill) {
            Payment::updateOrCreate(
                [
                    'bill_id' => $openBill->id,
                    'payment_method' => 'yape',
                ],
                [
                    'cashier_id' => $cashier->id,
                    'amount' => 20.00,
                    'operation_code' => 'YAPE-88291',
                    'receipt_number' => $this->receiptNumberFor($openBill),
                ]
            );
        }
    }

    private function receiptNumberFor(Bill $bill): string
    {
        return sprintf('B001-%05d', $bill->id);
    }
}
