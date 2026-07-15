import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { applyApiValidationErrors, clearApiValidationError } from '../../../core/utils/form-error.util';
import { isApiErrorResponse } from '../../../models/api-error.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: '../auth-page.css'
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(255)]]
  });

  isSubmitting = false;
  submitted = false;
  serverMessage = '';

  submit(): void {
    this.submitted = true;
    this.serverMessage = '';

    if (this.loginForm.invalid || this.isSubmitting) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.authService
      .login(this.loginForm.getRawValue())
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => void this.router.navigateByUrl(this.safeReturnUrl()),
        error: (error: unknown) => this.handleError(error)
      });
  }

  clearServerError(field: string): void {
    clearApiValidationError(this.loginForm, field);
    this.serverMessage = '';
  }

  fieldError(field: 'email' | 'password'): string | null {
    const control = this.loginForm.controls[field];

    if (!control.errors || (!control.touched && !this.submitted)) {
      return null;
    }

    if (control.errors['server']) {
      return String(control.errors['server']);
    }

    if (control.errors['required']) {
      return field === 'email' ? 'Email address is required.' : 'Password is required.';
    }

    if (control.errors['email']) {
      return 'Enter a valid email address.';
    }

    if (control.errors['minlength']) {
      return 'Password must be at least 8 characters.';
    }

    if (control.errors['maxlength']) {
      return 'This value is too long.';
    }

    return 'Check this field and try again.';
  }

  private handleError(error: unknown): void {
    if (error instanceof HttpErrorResponse && isApiErrorResponse(error.error)) {
      if (error.status === 422 && error.error.errors) {
        applyApiValidationErrors(this.loginForm, error.error.errors);
      }

      this.serverMessage = error.error.message;
      return;
    }

    this.serverMessage =
      error instanceof HttpErrorResponse && error.status === 0
        ? 'Unable to connect. Check your connection and try again.'
        : "We couldn't log you in. Please try again.";
  }

  private safeReturnUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    return returnUrl?.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/';
  }
}
