<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\RespondsWithRawgPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    use RespondsWithRawgPagination;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
            'page_size' => ['nullable', 'integer', 'between:1,100'],
        ]);
        $search = trim((string) ($validated['search'] ?? ''));
        $paginator = User::query()
            ->with('role')
            ->when($search, fn ($query) => $query->where(function ($query) use ($search): void {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            }))
            ->latest('id')
            ->paginate((int) ($validated['page_size'] ?? 20))
            ->withQueryString();

        return $this->paginatedResponse($paginator, UserResource::class);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = User::query()->create($request->validated());

        return response()->json((new UserResource($user->load('role')))->resolve($request), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user): UserResource
    {
        return new UserResource($user->load('role'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user): UserResource
    {
        $validated = $request->validated();

        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        $user = DB::transaction(function () use ($user, $validated): User {
            $adminIds = $this->lockAdministratorIds();
            $lockedUser = User::query()->with('role')->lockForUpdate()->findOrFail($user->id);

            if (isset($validated['role_id']) && $validated['role_id'] !== $lockedUser->role_id) {
                $newRole = Role::query()->findOrFail($validated['role_id']);

                if ($lockedUser->isAdmin() && $newRole->name !== Role::ADMIN) {
                    $this->ensureAnotherAdminRemains($lockedUser, $adminIds);
                }
            }

            $lockedUser->update($validated);

            return $lockedUser;
        }, 3);

        return new UserResource($user->refresh()->load('role'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        DB::transaction(function () use ($request, $user): void {
            $adminIds = $this->lockAdministratorIds();
            $lockedUser = User::query()->with('role')->lockForUpdate()->findOrFail($user->id);

            if ($request->user()->is($lockedUser)) {
                throw ValidationException::withMessages([
                    'user' => ['You cannot delete your own account from the admin panel.'],
                ]);
            }

            if ($lockedUser->isAdmin()) {
                $this->ensureAnotherAdminRemains($lockedUser, $adminIds);
            }

            $lockedUser->tokens()->delete();
            $lockedUser->delete();
        }, 3);

        return response()->json(['message' => 'User deleted.']);
    }

    /** @return Collection<int, int> */
    private function lockAdministratorIds(): Collection
    {
        $adminRoleId = Role::query()->where('name', Role::ADMIN)->value('id');

        return User::query()
            ->where('role_id', $adminRoleId)
            ->orderBy('id')
            ->lockForUpdate()
            ->pluck('id');
    }

    /** @param Collection<int, int> $adminIds */
    private function ensureAnotherAdminRemains(User $user, Collection $adminIds): void
    {
        if ($adminIds->contains($user->id) && $adminIds->count() <= 1) {
            throw ValidationException::withMessages([
                'role_id' => ['At least one administrator must remain.'],
            ]);
        }
    }
}
