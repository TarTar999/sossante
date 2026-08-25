<?php

namespace App\Http\Requests\HealthRecords;

use App\Enums\RecordRelationship;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreHealthRecordRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'date_of_birth' => ['nullable', 'date', 'before_or_equal:today'],
            'relationship' => ['required', 'string', Rule::enum(RecordRelationship::class)],
            'cover_photo' => ['nullable', 'image', 'max:5120'], // 5MB max
        ];
    }

    /**
     * Get custom messages for validation errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Le nom est obligatoire.',
            'date_of_birth.before_or_equal' => 'La date de naissance doit être dans le passé.',
            'cover_photo.image' => 'Le fichier doit être une image.',
            'cover_photo.max' => 'L\'image ne doit pas dépasser 5 Mo.',
        ];
    }
}
