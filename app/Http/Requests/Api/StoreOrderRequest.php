<?php

namespace App\Http\Requests\Api;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreOrderRequest extends FormRequest
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
            'bill_id' => ['required', 'integer', 'exists:bills,id'],
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
            'menu_modality_id' => ['nullable', 'integer', 'exists:menu_modalities,id'],
            'components' => ['nullable', 'array'],
            'components.*' => ['integer', 'distinct', 'exists:daily_menu_products,id'],
            'quantity' => ['nullable', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /** @return array<int, callable(Validator): void> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($this->filled('product_id') && $this->filled('menu_modality_id')) {
                $validator->errors()->add('product_id', 'Seleccione un producto o una modalidad, no ambos.');
            }
        }];
    }
}
