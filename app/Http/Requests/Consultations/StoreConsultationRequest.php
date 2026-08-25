<?php

namespace App\Http\Requests\Consultations;

use App\Enums\ConsultationUrgency;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreConsultationRequest extends FormRequest
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
            'urgency' => ['required', 'string', Rule::enum(ConsultationUrgency::class)],
            'symptoms' => ['required', 'string', 'min:10', 'max:2000'],
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
            'urgency.required' => 'Le niveau d\'urgence est obligatoire.',
            'symptoms.required' => 'La description des symptômes est obligatoire.',
            'symptoms.min' => 'La description doit contenir au moins 10 caractères.',
            'symptoms.max' => 'La description ne doit pas dépasser 2000 caractères.',
        ];
    }
}
