import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { forkJoin } from 'rxjs';

import {
  AdminRole,
  AdminUser,
  AdminUserPayload,
  LaravelValidationErrors,
} from '../../models/admin.model';
import { AdminService } from '../../services/admin.service';
import { AdminFormErrors } from '../../shared/admin-form-errors/admin-form-errors';
import {
  extractLaravelValidationErrors,
  requestErrorMessage,
  validationMessagesFor,
} from '../../shared/admin-validation';

const passwordsMatch: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value as string | null;
  const confirmation = control.get('password_confirmation')?.value as string | null;
  return password && password !== confirmation ? { passwordMismatch: true } : null;
};

const STRONG_PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).+$/;

@Component({
  selector: 'app-admin-users',
  imports: [CommonModule, ReactiveFormsModule, AdminFormErrors],
  templateUrl: './admin-users.html',
  styleUrls: ['../../admin-shared.css', '../../admin-form-shared.css', './admin-users.css'],
})
export class AdminUsers implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly form = this.formBuilder.group(
    {
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(180)]],
      role_id: this.formBuilder.control<number | null>(null, [Validators.required]),
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(100),
          Validators.pattern(STRONG_PASSWORD_PATTERN),
        ],
      ],
      password_confirmation: ['', [Validators.required]],
    },
    { validators: passwordsMatch },
  );

  users: AdminUser[] = [];
  roles: AdminRole[] = [];
  editingId: number | null = null;
  count = 0;
  page = 1;
  nextPageUrl: string | null = null;
  previousPageUrl: string | null = null;
  isLoading = true;
  isSaving = false;
  deletingId: number | null = null;
  errorMessage = '';
  successMessage = '';
  validationErrors: LaravelValidationErrors = {};

  constructor(private adminService: AdminService) {}

  get isEditing(): boolean {
    return this.editingId !== null;
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  search(): void {
    this.loadUsers(1);
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.loadUsers(1);
  }

  editUser(user: AdminUser): void {
    this.editingId = user.id;
    this.validationErrors = {};
    this.errorMessage = '';
    this.configurePasswordValidation(true);
    this.form.reset({
      name: user.name,
      email: user.email,
      role_id: this.roleId(user),
      password: '',
      password_confirmation: '',
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  submit(): void {
    this.form.markAllAsTouched();
    this.errorMessage = '';
    this.successMessage = '';
    this.validationErrors = {};

    if (this.form.invalid) {
      this.errorMessage = 'Review the highlighted fields before saving.';
      return;
    }

    const value = this.form.getRawValue();

    if (value.role_id === null) {
      this.errorMessage = 'A role must be selected.';
      return;
    }

    const payload: AdminUserPayload = {
      name: value.name?.trim() || '',
      email: value.email?.trim() || '',
      role_id: value.role_id,
    };

    if (value.password) {
      payload.password = value.password;
      payload.password_confirmation = value.password_confirmation || '';
    }

    this.isSaving = true;
    const request = this.editingId
      ? this.adminService.updateUser(this.editingId, payload)
      : this.adminService.createUser(payload);

    request.subscribe({
      next: (user) => {
        this.successMessage = this.editingId
          ? `“${user.name}” was updated.`
          : `“${user.name}” was created.`;
        this.resetForm(false);
        this.loadUsers(this.page, false);
      },
      error: (error) => {
        this.validationErrors = extractLaravelValidationErrors(error);
        this.errorMessage = requestErrorMessage(error, 'The user could not be saved.');
        this.isSaving = false;
      },
      complete: () => {
        this.isSaving = false;
      },
    });
  }

  deleteUser(user: AdminUser): void {
    if (
      typeof window !== 'undefined' &&
      !window.confirm(`Delete user “${user.name}”? This action cannot be undone.`)
    ) {
      return;
    }

    this.deletingId = user.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        this.successMessage = `“${user.name}” was deleted.`;
        if (this.editingId === user.id) {
          this.resetForm(false);
        }
        const targetPage = this.users.length === 1 && this.page > 1 ? this.page - 1 : this.page;
        this.loadUsers(targetPage, false);
      },
      error: (error) => {
        this.errorMessage = requestErrorMessage(error, 'The user could not be deleted.');
        this.deletingId = null;
      },
      complete: () => {
        this.deletingId = null;
      },
    });
  }

  previousPage(): void {
    if (this.previousPageUrl && this.page > 1) {
      this.loadUsers(this.page - 1);
    }
  }

  nextPage(): void {
    if (this.nextPageUrl) {
      this.loadUsers(this.page + 1);
    }
  }

  roleName(user: AdminUser): string {
    return typeof user.role === 'string' ? user.role : user.role.label;
  }

  field(name: keyof typeof this.form.controls): AbstractControl {
    return this.form.controls[name];
  }

  serverErrorsFor(field: string): string[] {
    return validationMessagesFor(this.validationErrors, field);
  }

  private loadInitialData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      roles: this.adminService.getRoles(),
      users: this.adminService.getUsers({ page: 1, pageSize: 15 }),
    }).subscribe({
      next: ({ roles, users }) => {
        this.roles = roles;
        this.applyUsersResponse(users, 1);
      },
      error: (error) => {
        this.errorMessage = requestErrorMessage(error, 'Users and roles could not be loaded.');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  private loadUsers(page: number = this.page, resetFeedback = true): void {
    this.isLoading = true;
    this.errorMessage = '';

    if (resetFeedback) {
      this.successMessage = '';
    }

    this.adminService.getUsers({ page, pageSize: 15, search: this.searchControl.value }).subscribe({
      next: (response) => {
        this.applyUsersResponse(response, page);
      },
      error: (error) => {
        this.errorMessage = requestErrorMessage(error, 'Users could not be loaded.');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  private applyUsersResponse(
    response: { count: number; next: string | null; previous: string | null; results: AdminUser[] },
    page: number,
  ): void {
    this.users = response.results;
    this.count = response.count;
    this.nextPageUrl = response.next;
    this.previousPageUrl = response.previous;
    this.page = page;
  }

  private configurePasswordValidation(editing: boolean): void {
    const passwordControl = this.form.controls.password;
    const confirmationControl = this.form.controls.password_confirmation;

    passwordControl.setValidators(
      editing
        ? [
            Validators.minLength(8),
            Validators.maxLength(100),
            Validators.pattern(STRONG_PASSWORD_PATTERN),
          ]
        : [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(100),
            Validators.pattern(STRONG_PASSWORD_PATTERN),
          ],
    );
    confirmationControl.setValidators(editing ? [] : [Validators.required]);
    passwordControl.updateValueAndValidity({ emitEvent: false });
    confirmationControl.updateValueAndValidity({ emitEvent: false });
  }

  private resetForm(clearFeedback = true): void {
    this.editingId = null;
    this.validationErrors = {};
    this.configurePasswordValidation(false);
    this.form.reset({
      name: '',
      email: '',
      role_id: null,
      password: '',
      password_confirmation: '',
    });

    if (clearFeedback) {
      this.errorMessage = '';
    }
  }

  private roleId(user: AdminUser): number | null {
    if (user.role_id) {
      return user.role_id;
    }

    if (typeof user.role !== 'string') {
      return user.role.id;
    }

    const userRoleName = user.role.toLowerCase();
    return this.roles.find((role) => role.name.toLowerCase() === userRoleName)?.id || null;
  }
}
