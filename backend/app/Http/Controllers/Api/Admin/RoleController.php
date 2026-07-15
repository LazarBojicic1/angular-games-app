<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\RespondsWithRawgPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRoleRequest;
use App\Http\Requests\Admin\UpdateRoleRequest;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RoleController extends Controller
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
        $paginator = Role::query()
            ->withCount('users')
            ->when(
                trim((string) ($validated['search'] ?? '')),
                fn ($query, $search) => $query->where('name', 'like', "%{$search}%")
                    ->orWhere('label', 'like', "%{$search}%"),
            )
            ->orderBy('id')
            ->paginate((int) ($validated['page_size'] ?? 20))
            ->withQueryString();

        return $this->paginatedResponse($paginator, RoleResource::class);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = Role::query()->create($request->validated());

        return response()->json((new RoleResource($role->loadCount('users')))->resolve($request), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Role $role): RoleResource
    {
        return new RoleResource($role->loadCount('users'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRoleRequest $request, Role $role): RoleResource
    {
        if (
            in_array($role->name, [Role::ADMIN, Role::USER], true)
            && $request->filled('name')
            && $request->string('name')->toString() !== $role->name
        ) {
            throw ValidationException::withMessages([
                'name' => ['The built-in admin and user role names cannot be changed.'],
            ]);
        }

        $role->update($request->validated());

        return new RoleResource($role->refresh()->loadCount('users'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role): JsonResponse
    {
        if (in_array($role->name, [Role::ADMIN, Role::USER], true) || $role->users()->exists()) {
            throw ValidationException::withMessages([
                'role' => ['Built-in or assigned roles cannot be deleted.'],
            ]);
        }

        $role->delete();

        return response()->json(['message' => 'Role deleted.']);
    }
}
