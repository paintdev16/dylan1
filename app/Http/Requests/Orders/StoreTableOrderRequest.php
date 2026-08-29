<?php

namespace App\Http\Requests\Orders;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreTableOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['super-admin', 'admin', 'mozo']) === true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'customer_count' => ['nullable', 'integer', 'min:1', 'max:50'],
            'request_token' => ['nullable', 'uuid'],
            'items' => ['nullable', 'array', 'min:1'],
            'items.*.product_id' => ['nullable', 'integer', 'exists:products,id', 'required_without:items.*.menu_modality_id'],
            'items.*.menu_modality_id' => ['nullable', 'integer', 'exists:menu_modalities,id', 'required_without:items.*.product_id'],
            'items.*.components' => ['nullable', 'array'],
            'items.*.components.*' => ['integer', 'exists:daily_menu_products,id'],
            'items.*.quantity' => ['required_with:items', 'integer', 'min:1'],
            'items.*.notes' => ['nullable', 'string', 'max:1000'],
            'product_id' => ['nullable', 'integer', 'exists:products,id', 'required_without_all:menu_modality_id,items'],
            'menu_modality_id' => ['nullable', 'integer', 'exists:menu_modalities,id', 'required_without_all:product_id,items'],
            'components' => ['nullable', 'array'],
            'components.*' => ['integer', 'exists:daily_menu_products,id'],
            'quantity' => ['required_without:items', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /** @return array<int, \Closure(Validator): void> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            $items = $this->input('items', []);

            foreach ($items as $index => $item) {
                if (! empty($item['product_id']) && ! empty($item['menu_modality_id'])) {
                    $validator->errors()->add("items.{$index}", 'Cada ítem debe ser un producto o una modalidad, no ambos.');
                }
            }

            if ($items !== [] && ($this->filled('product_id') || $this->filled('menu_modality_id'))) {
                $validator->errors()->add('items', 'Envía items o un único producto/modalidad en la raíz, no ambos formatos.');
            }

            if (empty($items) && $this->filled('product_id') && $this->filled('menu_modality_id')) {
                $validator->errors()->add('product_id', 'Debe seleccionar un producto o una modalidad, no ambos.');
            }
        }];
    }
}
