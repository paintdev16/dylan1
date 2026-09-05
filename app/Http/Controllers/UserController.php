<?php

namespace App\Http\Controllers;

use App\Http\Requests\Users\IndexUserRequest;
use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(IndexUserRequest $request): Response
    {
        $filters = $request->validated();
        $users = User::with('roles')
            ->where('is_root', false)
            ->whereDoesntHave('roles', fn ($query) => $query->whereIn('name', User::PROTECTED_ROLES))
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($filters['role'] ?? null, fn ($query, string $role) => $query->whereHas('roles', fn ($query) => $query->where('name', $role)))
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('users/index', [
            'users' => UserResource::collection($users)->resolve(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'total' => $users->total(),
            ],
            'roles' => Role::query()
                ->whereNotIn('name', User::PROTECTED_ROLES)
                ->with('permissions:id,name')
                ->orderBy('name')
                ->get()
                ->map(fn (Role $role) => [
                    'name' => $role->name,
                    'permissions' => $role->permissions->pluck('name')->values()->all(),
                ]),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'role' => $filters['role'] ?? '',
            ],
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
        ]);

        if (! empty($data['role'])) {
            $user->syncRoles($data['role']);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User created.')]);

        return to_route('users.index');
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();

        $user->name = $data['name'];
        $user->email = $data['email'];

        if (! empty($data['password'])) {
            $user->password = $data['password'];
        }

        $user->save();

        if (array_key_exists('role', $data)) {
            $user->syncRoles($data['role'] ?? []);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User updated.')]);

        return to_route('users.index');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_if($user->isProtectedAccount(), 403);

        if ($request->user()->id === $user->id) {
            return back()->withErrors(['general' => __('You cannot delete your own account.')]);
        }

        $user->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User deleted.')]);

        return to_route('users.index');
    }
}
