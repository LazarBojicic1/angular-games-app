import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { AdminRole, AdminRolePayload, LaravelValidationErrors } from '../../models/admin.model';
import { AdminService } from '../../services/admin.service';
import { AdminFormErrors } from '../../shared/admin-form-errors/admin-form-errors';
import {
  extractLaravelValidationErrors,
  requestErrorMessage,
  validationMessagesFor,
} from '../../shared/admin-validation';

@Component({
  selector: 'app-admin-roles',
  imports: [CommonModule, ReactiveFormsModule, AdminFormErrors],
  templateUrl: './admin-roles.html',
  styleUrls: ['../../admin-shared.css', '../../admin-form-shared.css', './admin-roles.css'],
})
export class AdminRoles implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly form = this.formBuilder.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(40),
        Validators.pattern(/^[a-z][a-z0-9_]*$/),
      ],
    ],
    label: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
  });

  roles: AdminRole[] = [];
  editingId: number | null = null;
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

  get filteredRoles(): AdminRole[] {
    const search = this.searchControl.value.trim().toLowerCase();
    return search
      ? this.roles.filter(
          (role) =>
            role.name.toLowerCase().includes(search) || role.label.toLowerCase().includes(search),
        )
      : this.roles;
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  editRole(role: AdminRole): void {
    this.editingId = role.id;
    this.errorMessage = '';
    this.validationErrors = {};
    this.form.reset({ name: role.name, label: role.label });
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
      this.errorMessage = 'Review the highlighted field before saving.';
      return;
    }

    const payload: AdminRolePayload = {
      name: this.form.controls.name.value?.trim() || '',
      label: this.form.controls.label.value?.trim() || '',
    };
    const request = this.editingId
      ? this.adminService.updateRole(this.editingId, payload)
      : this.adminService.createRole(payload);

    this.isSaving = true;
    request.subscribe({
      next: (role) => {
        this.successMessage = this.editingId
          ? `Role “${role.label}” was updated.`
          : `Role “${role.label}” was created.`;
        this.resetForm(false);
        this.loadRoles(false);
      },
      error: (error) => {
        this.validationErrors = extractLaravelValidationErrors(error);
        this.errorMessage = requestErrorMessage(error, 'The role could not be saved.');
        this.isSaving = false;
      },
      complete: () => {
        this.isSaving = false;
      },
    });
  }

  deleteRole(role: AdminRole): void {
    if (this.isProtected(role)) {
      const assignedUsers = role.users_count ?? 0;
      const userLabel = assignedUsers === 1 ? 'user' : 'users';
      this.errorMessage = role.users_count
        ? `Role “${role.label}” is assigned to ${assignedUsers} ${userLabel} and cannot be deleted.`
        : `The built-in “${role.label}” role cannot be deleted.`;
      return;
    }

    if (
      typeof window !== 'undefined' &&
      !window.confirm(`Delete role “${role.label}”? This action cannot be undone.`)
    ) {
      return;
    }

    this.deletingId = role.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminService.deleteRole(role.id).subscribe({
      next: () => {
        this.successMessage = `Role “${role.label}” was deleted.`;
        if (this.editingId === role.id) {
          this.resetForm(false);
        }
        this.loadRoles(false);
      },
      error: (error) => {
        this.errorMessage = requestErrorMessage(
          error,
          'The role could not be deleted. It may still be assigned to one or more users.',
        );
        this.deletingId = null;
      },
      complete: () => {
        this.deletingId = null;
      },
    });
  }

  field(name: keyof typeof this.form.controls): AbstractControl {
    return this.form.controls[name];
  }

  serverErrorsFor(field: string): string[] {
    return validationMessagesFor(this.validationErrors, field);
  }

  isProtected(role: AdminRole): boolean {
    return role.name === 'admin' || role.name === 'user' || !!role.users_count;
  }

  private loadRoles(resetFeedback = true): void {
    this.isLoading = true;
    this.errorMessage = '';

    if (resetFeedback) {
      this.successMessage = '';
    }

    this.adminService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (error) => {
        this.errorMessage = requestErrorMessage(error, 'Roles could not be loaded.');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  private resetForm(clearFeedback = true): void {
    this.editingId = null;
    this.validationErrors = {};
    this.form.reset({ name: '', label: '' });

    if (clearFeedback) {
      this.errorMessage = '';
    }
  }
}
