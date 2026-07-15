<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreGenreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'rawg_id' => ['nullable', 'integer', 'min:1', 'unique:genres,rawg_id'],
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['required', 'alpha_dash:ascii', 'max:120', 'unique:genres,slug'],
            'rawg_games_count' => ['nullable', 'integer', 'min:0'],
            'image_background' => ['nullable', 'string', 'max:2048'],
        ];
    }
}
