<?php

namespace App\Http\Requests\Users;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create users') === true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique(User::class)],
            'password' => 'required|string|min:8',
            'role' => [
                'nullable',
                'string',
                Rule::in(Role::query()->whereNotIn('name', User::PROTECTED_ROLES)->pluck('name')->all()),
            ],
        ];
    }
}
