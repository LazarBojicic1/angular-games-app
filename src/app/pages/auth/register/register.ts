import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { applyApiValidationErrors, clearApiValidationError } from '../../../core/utils/form-error.util';
import { isApiErrorResponse } from '../../../models/api-error.model';

const passwordsMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmation = control.get('password_confirmation')?.value;

  return password && confirmation && password !== confirmation ? { passwordsMismatch: true } : null;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: '../auth-page.css'
})
export class Register {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly registerForm = this.formBuilder.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(255),
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
        ]
      ],
      password_confirmation: ['', [Validators.required]]
    },
    { validators: passwordsMatchValidator }
  );

  isSubmitting = false;
  submitted = false;
  serverMessage = '';

  submit(): void {
    this.submitted = true;
    this.serverMessage = '';

    if (this.registerForm.invalid || this.isSubmitting) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.authService
      .register(this.registerForm.getRawValue())
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => void this.router.navigateByUrl('/'),
        error: (error: unknown) => this.handleError(error)
      });
  }

  clearServerError(field: string): void {
    clearApiValidationError(this.registerForm, field);
    this.serverMessage = '';
    this.registerForm.updateValueAndValidity({ emitEvent: false });
  }

  fieldError(field: 'name' | 'email' | 'password' | 'password_confirmation'): string | null {
    const control = this.registerForm.controls[field];

    if (!control.errors || (!control.touched && !this.submitted)) {
      if (
        field === 'password_confirmation' &&
        this.registerForm.hasError('passwordsMismatch') &&
        (control.touched || this.submitted)
      ) {
        return 'Passwords do not match.';
      }

      return null;
    }

    if (control.errors['server']) {
      return String(control.errors['server']);
    }

    if (control.errors['required']) {
      const labels = {
        name: 'Name is required.',
        email: 'Email address is required.',
        password: 'Password is required.',
        password_confirmation: 'Please confirm your password.'
      };
      return labels[field];
    }

    if (control.errors['email']) {
      return 'Enter a valid email address.';
    }

    if (control.errors['minlength']) {
      return field === 'name'
        ? 'Name must be at least 2 characters.'
        : 'Password must be at least 8 characters.';
    }

    if (control.errors['pattern']) {
      return 'Password must include at least one letter and one number.';
    }

    if (control.errors['maxlength']) {
      return 'This value is too long.';
    }

    return 'Check this field and try again.';
  }

  private handleError(error: unknown): void {
    if (error instanceof HttpErrorResponse && isApiErrorResponse(error.error)) {
      if (error.status === 422 && error.error.errors) {
        applyApiValidationErrors(this.registerForm, error.error.errors);
      }

      this.serverMessage = error.error.message;
      return;
    }

    this.serverMessage =
      error instanceof HttpErrorResponse && error.status === 0
        ? 'Unable to connect. Check your connection and try again.'
        : "We couldn't create your account. Please try again.";
  }
}
