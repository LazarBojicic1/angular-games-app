import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  AdminPlatform,
  AdminPlatformPayload,
  LaravelValidationErrors,
} from '../../models/admin.model';
import { AdminService } from '../../services/admin.service';
import { AdminFormErrors } from '../../shared/admin-form-errors/admin-form-errors';
import {
  extractLaravelValidationErrors,
  requestErrorMessage,
  validationMessagesFor,
} from '../../shared/admin-validation';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const URL_PATTERN = /^(https?:\/\/|\/).+/i;

@Component({
  selector: 'app-admin-platforms',
  imports: [CommonModule, ReactiveFormsModule, AdminFormErrors],
  templateUrl: './admin-platforms.html',
  styleUrls: ['../../admin-shared.css', '../../admin-form-shared.css', './admin-platforms.css'],
})
export class AdminPlatforms implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly form = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    slug: ['', [Validators.required, Validators.maxLength(120), Validators.pattern(SLUG_PATTERN)]],
    image_background: ['', [Validators.pattern(URL_PATTERN)]],
  });

  platforms: AdminPlatform[] = [];
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
    this.loadPlatforms();
  }

  search(): void {
    this.loadPlatforms(1);
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.loadPlatforms(1);
  }

  editPlatform(platform: AdminPlatform): void {
    this.editingId = platform.id;
    this.validationErrors = {};
    this.errorMessage = '';
    this.form.reset({
      name: platform.name,
      slug: platform.slug,
      image_background: platform.image_background || '',
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  fillSlug(): void {
    if (!this.form.controls.slug.value?.trim()) {
      this.form.controls.slug.setValue(this.slugify(this.form.controls.name.value || ''));
    }
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

    this.isSaving = true;
    const value = this.form.getRawValue();
    const payload: AdminPlatformPayload = {
      name: value.name?.trim() || '',
      slug: value.slug?.trim() || '',
      image_background: value.image_background?.trim() || null,
    };
    const request = this.editingId
      ? this.adminService.updatePlatform(this.editingId, payload)
      : this.adminService.createPlatform(payload);

    request.subscribe({
      next: (platform) => {
        this.successMessage = this.editingId
          ? `“${platform.name}” was updated.`
          : `“${platform.name}” was created.`;
        this.resetForm(false);
        this.loadPlatforms(this.page, false);
      },
      error: (error) => {
        this.validationErrors = extractLaravelValidationErrors(error);
        this.errorMessage = requestErrorMessage(error, 'The platform could not be saved.');
        this.isSaving = false;
      },
      complete: () => {
        this.isSaving = false;
      },
    });
  }

  deletePlatform(platform: AdminPlatform): void {
    if (
      typeof window !== 'undefined' &&
      !window.confirm(`Delete platform “${platform.name}”? This action cannot be undone.`)
    ) {
      return;
    }

    this.deletingId = platform.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminService.deletePlatform(platform.id).subscribe({
      next: () => {
        this.successMessage = `“${platform.name}” was deleted.`;
        if (this.editingId === platform.id) {
          this.resetForm(false);
        }
        const targetPage = this.platforms.length === 1 && this.page > 1 ? this.page - 1 : this.page;
        this.loadPlatforms(targetPage, false);
      },
      error: (error) => {
        this.errorMessage = requestErrorMessage(error, 'The platform could not be deleted.');
        this.deletingId = null;
      },
      complete: () => {
        this.deletingId = null;
      },
    });
  }

  previousPage(): void {
    if (this.previousPageUrl && this.page > 1) {
      this.loadPlatforms(this.page - 1);
    }
  }

  nextPage(): void {
    if (this.nextPageUrl) {
      this.loadPlatforms(this.page + 1);
    }
  }

  field(name: keyof typeof this.form.controls): AbstractControl {
    return this.form.controls[name];
  }

  serverErrorsFor(field: string): string[] {
    return validationMessagesFor(this.validationErrors, field);
  }

  private loadPlatforms(page: number = this.page, resetFeedback = true): void {
    this.isLoading = true;
    this.errorMessage = '';

    if (resetFeedback) {
      this.successMessage = '';
    }

    this.adminService
      .getPlatforms({ page, pageSize: 15, search: this.searchControl.value })
      .subscribe({
        next: (response) => {
          this.platforms = response.results;
          this.count = response.count;
          this.nextPageUrl = response.next;
          this.previousPageUrl = response.previous;
          this.page = page;
        },
        error: (error) => {
          this.errorMessage = requestErrorMessage(error, 'Platforms could not be loaded.');
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
    this.form.reset({ name: '', slug: '', image_background: '' });

    if (clearFeedback) {
      this.errorMessage = '';
    }
  }

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
