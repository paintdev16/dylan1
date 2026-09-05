<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Receipt;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class ReceiptController extends Controller
{
    public function print(Receipt $receipt): Response
    {
        $receipt->load(['bill.restaurantTable', 'bill.openingWaiter', 'payment']);

        return response()->view('receipts.ticket', compact('receipt'));
    }

    public function download(Receipt $receipt): Response
    {
        $receipt->load(['bill.restaurantTable', 'bill.openingWaiter', 'payment']);

        return Pdf::loadView('receipts.ticket', compact('receipt'))
            ->setPaper([0, 0, 226.77, 600], 'portrait')
            ->download('ticket-'.$receipt->number.'.pdf');
    }
}
