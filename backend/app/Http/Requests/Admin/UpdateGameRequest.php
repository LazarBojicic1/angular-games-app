<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGameRequest extends FormRequest
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
            'rawg_id' => ['nullable', 'integer', 'min:1', Rule::unique('games', 'rawg_id')->ignore($this->route('game'))],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'required', 'alpha_dash:ascii', 'max:255', Rule::unique('games', 'slug')->ignore($this->route('game'))],
            'background_image' => ['nullable', 'string', 'max:2048'],
            'description' => ['nullable', 'string'],
            'website' => ['nullable', 'string', 'max:2048'],
            'released' => ['nullable', 'date_format:Y-m-d'],
            'rating' => ['sometimes', 'required', 'numeric', 'between:0,5'],
            'metacritic' => ['nullable', 'integer', 'between:0,100'],
            'playtime' => ['sometimes', 'required', 'integer', 'between:0,65535'],
            'developers' => ['sometimes', 'array', 'max:30'],
            'developers.*' => ['string', 'max:120', 'distinct'],
            'publishers' => ['sometimes', 'array', 'max:30'],
            'publishers.*' => ['string', 'max:120', 'distinct'],
            'tags' => ['sometimes', 'array', 'max:60'],
            'tags.*' => ['string', 'max:120', 'distinct'],
            'screenshots' => ['sometimes', 'array', 'max:12'],
            'screenshots.*' => ['string', 'max:2048', 'distinct'],
            'genre_ids' => ['sometimes', 'array'],
            'genre_ids.*' => ['integer', 'distinct', 'exists:genres,id'],
            'platform_ids' => ['sometimes', 'array'],
            'platform_ids.*' => ['integer', 'distinct', 'exists:platforms,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('description') && $this->has('description_raw')) {
            $this->merge(['description' => $this->input('description_raw')]);
        }
    }
}
