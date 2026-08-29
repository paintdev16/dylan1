<?php

namespace App\Http\Requests\Orders;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

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
            'items' => ['nullable', 'array', 'min:1'],
            'items.*.product_id' => ['nullable', 'integer', 'exists:products,id'],
            'items.*.menu_modality_id' => ['nullable', 'integer', 'exists:menu_modalities,id'],
            'items.*.components' => ['nullable', 'array'],
            'items.*.components.*' => ['integer', 'exists:daily_menu_products,id'],
            'items.*.quantity' => ['required_with:items', 'integer', 'min:1'],
            'items.*.notes' => ['nullable', 'string', 'max:1000'],
            'product_id' => ['nullable', 'integer', 'exists:products,id', 'required_without:menu_modality_id'],
            'menu_modality_id' => ['nullable', 'integer', 'exists:menu_modalities,id', 'required_without:product_id'],
            'components' => ['nullable', 'array'],
            'components.*' => ['integer', 'exists:daily_menu_products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
