import { HttpErrorResponse } from '@angular/common/http';

import { LaravelValidationErrors, LaravelValidationResponse } from '../models/admin.model';

export function extractLaravelValidationErrors(error: unknown): LaravelValidationErrors {
  if (!(error instanceof HttpErrorResponse) || error.status !== 422) {
    return {};
  }

  const response = error.error as LaravelValidationResponse | null;
  const errors = response?.errors;

  if (!errors || typeof errors !== 'object') {
    return {};
  }

  return Object.entries(errors).reduce<LaravelValidationErrors>((result, [field, messages]) => {
    result[field] = Array.isArray(messages) ? messages : [messages];
    return result;
  }, {});
}

export function validationMessagesFor(errors: LaravelValidationErrors, field: string): string[] {
  return Object.entries(errors)
    .filter(([key]) => key === field || key.startsWith(`${field}.`))
    .flatMap(([, messages]) => messages);
}

export function requestErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  const response = error.error as LaravelValidationResponse | null;

  if (response?.errors) {
    const firstError = Object.values(response.errors)[0];
    const firstMessage = Array.isArray(firstError) ? firstError[0] : firstError;

    if (firstMessage) {
      return firstMessage;
    }
  }

  if (response?.message) {
    return response.message;
  }

  if (error.status === 403) {
    return 'You do not have permission to perform this action.';
  }

  if (error.status === 404) {
    return 'The requested item no longer exists.';
  }

  return fallback;
}
