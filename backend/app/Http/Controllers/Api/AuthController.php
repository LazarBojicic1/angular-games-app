<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = DB::transaction(function () use ($request): User {
            $role = Role::query()->firstOrCreate(
                ['name' => Role::USER],
                ['label' => 'User'],
            );

            return User::query()->create([
                ...$request->safe()->only(['name', 'email', 'password']),
                'role_id' => $role->id,
            ]);
        });

        return $this->tokenResponse($user, 'Registration successful.', 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::query()->where('email', $request->string('email'))->first();

        if (! $user || ! Hash::check($request->string('password'), $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        return $this->tokenResponse($user, 'Login successful.');
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($request->user()->load('role'));
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logout successful.']);
    }

    private function tokenResponse(User $user, string $message, int $status = 200): JsonResponse
    {
        $user->load('role');
        $user->tokens()->where('name', 'angular-client')->delete();
        $token = $user->createToken('angular-client')->plainTextToken;

        return response()->json([
            'message' => $message,
            'token' => $token,
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => (new UserResource($user))->resolve(request()),
        ], $status);
    }
}
