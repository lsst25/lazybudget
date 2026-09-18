import { HttpErrorResponse } from '@angular/common/http';

type ValidationErrors = Record<string, string[]>;

/**
 * Laravel answers failed validation with 422 and `{ message, errors: { field: [msg, …] } }`.
 * Returns that map, or an empty object for any other error.
 */
export function validationErrors(error: HttpErrorResponse | null): ValidationErrors {
  const body: unknown = error?.error;
  if (error?.status === 422 && body && typeof body === 'object' && 'errors' in body) {
    return (body as { errors: ValidationErrors }).errors;
  }
  return {};
}

/** A single human-readable line for an API failure, suitable for an alert. */
export function apiErrorMessage(error: HttpErrorResponse | null): string | null {
  if (!error) {
    return null;
  }

  const firstValidationMessage = Object.values(validationErrors(error))[0]?.[0];
  if (firstValidationMessage) {
    return firstValidationMessage;
  }

  if (error.status === 0) {
    return 'Cannot reach the server. Check your connection and try again.';
  }

  const body: unknown = error.error;
  if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
    return body.message;
  }

  return `Request failed (${error.status}).`;
}
