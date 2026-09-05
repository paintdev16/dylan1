<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Ticket {{ $receipt->number }}</title>
    <style>
        @page { margin: 8px; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #111; margin: 0; }
        .center { text-align: center; }
        .title { font-size: 16px; font-weight: bold; }
        .muted { color: #555; }
        .line { border-top: 1px dashed #777; margin: 8px 0; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 2px 0; vertical-align: top; }
        .right { text-align: right; }
        .total { font-size: 14px; font-weight: bold; }
        .components { color: #555; font-size: 9px; }
    </style>
</head>
<body>
    <div class="center">
        <div class="title">{{ config('app.name', 'Restaurante') }}</div>
        <div class="muted">Ticket de venta</div>
        <div>{{ $receipt->number }}</div>
        <div class="muted">{{ $receipt->issued_at?->format('d/m/Y H:i') }}</div>
    </div>

    <div class="line"></div>
    <table>
        <tr><td>Mesa</td><td class="right">{{ $receipt->bill->restaurantTable?->number ? 'Mesa '.$receipt->bill->restaurantTable->number : 'Para llevar' }}</td></tr>
        <tr><td>Cliente</td><td class="right">{{ $receipt->customer_name }}</td></tr>
        <tr><td>Documento</td><td class="right">{{ $receipt->customer_document }}</td></tr>
    </table>

    <div class="line"></div>
    <table>
        @foreach (($receipt->bill->sale_snapshot ?? []) as $order)
            @foreach (($order['items'] ?? []) as $item)
                <tr>
                    <td>{{ $item['quantity'] }} x {{ $item['description'] }}
                        @if (!empty($item['components']))
                            <div class="components">{{ implode(' + ', $item['components']) }}</div>
                        @endif
                    </td>
                    <td class="right">S/. {{ number_format((float) $item['subtotal'], 2) }}</td>
                </tr>
            @endforeach
        @endforeach
    </table>

    <div class="line"></div>
    <table>
        <tr><td>Subtotal</td><td class="right">S/. {{ number_format((float) $receipt->subtotal, 2) }}</td></tr>
        <tr><td>IGV</td><td class="right">S/. {{ number_format((float) $receipt->tax, 2) }}</td></tr>
        <tr class="total"><td>Total</td><td class="right">S/. {{ number_format((float) $receipt->total, 2) }}</td></tr>
    </table>
    <p class="center muted">Pago: {{ $receipt->payment_method }}</p>
    <p class="center muted">Gracias por su preferencia</p>
    @if (!request()->boolean('preview'))
        <script>
            window.addEventListener('load', function () { window.print(); });
        </script>
    @endif
</body>
</html>
