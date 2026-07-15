export interface ApiValidationErrors {
  [field: string]: string[];
}

export interface ApiErrorResponse {
  message: string;
  errors?: ApiValidationErrors;
}

export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return 'message' in value && typeof value.message === 'string';
}
