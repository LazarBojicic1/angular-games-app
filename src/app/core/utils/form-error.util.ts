import { FormGroup } from '@angular/forms';

import { ApiValidationErrors } from '../../models/api-error.model';

export function applyApiValidationErrors(form: FormGroup, errors: ApiValidationErrors): void {
  Object.entries(errors).forEach(([field, messages]) => {
    const control = form.get(field);

    if (!control || !messages.length) {
      return;
    }

    control.setErrors({
      ...control.errors,
      server: messages[0]
    });
    control.markAsTouched();
  });
}

export function clearApiValidationError(form: FormGroup, field: string): void {
  const control = form.get(field);

  if (!control?.errors?.['server']) {
    return;
  }

  const { server: _server, ...remainingErrors } = control.errors;
  control.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);
}
