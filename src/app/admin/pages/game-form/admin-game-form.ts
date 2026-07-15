import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';

import {
  AdminGame,
  AdminGamePayload,
  AdminGenre,
  AdminNamedValue,
  AdminPlatform,
  AdminPlatformWrapper,
  AdminScreenshot,
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
const IMAGE_URL_PATTERN = /^(https?:\/\/|\/).+/i;
const URL_PATTERN = /^https?:\/\/.+/i;

@Component({
  selector: 'app-admin-game-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AdminFormErrors],
  templateUrl: './admin-game-form.html',
  styleUrls: ['../../admin-shared.css', '../../admin-form-shared.css', './admin-game-form.css'],
})
export class AdminGameForm implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  readonly form = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    slug: ['', [Validators.required, Validators.maxLength(170), Validators.pattern(SLUG_PATTERN)]],
    background_image: ['', [Validators.pattern(IMAGE_URL_PATTERN)]],
    description_raw: ['', [Validators.maxLength(12000)]],
    website: ['', [Validators.pattern(URL_PATTERN)]],
    released: [''],
    rating: [0, [Validators.required, Validators.min(0), Validators.max(5)]],
    metacritic: this.formBuilder.control<number | null>(null, [
      Validators.min(0),
      Validators.max(100),
    ]),
    playtime: [0, [Validators.required, Validators.min(0), Validators.max(10000)]],
    genre_ids: this.formBuilder.control<number[]>([], [Validators.required]),
    platform_ids: this.formBuilder.control<number[]>([], [Validators.required]),
    developers: [''],
    publishers: [''],
    tags: [''],
    screenshots: [''],
  });

  genres: AdminGenre[] = [];
  platforms: AdminPlatform[] = [];
  gameId: number | null = null;
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  validationErrors: LaravelValidationErrors = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
  ) {}

  get isEditMode(): boolean {
    return this.gameId !== null;
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Edit game' : 'Create game';
  }

  ngOnInit(): void {
    const routeId = Number(this.route.snapshot.paramMap.get('id'));
    this.gameId = Number.isInteger(routeId) && routeId > 0 ? routeId : null;
    this.loadFormData();
  }

  submit(): void {
    this.form.markAllAsTouched();
    this.errorMessage = '';
    this.validationErrors = {};

    if (this.form.invalid) {
      this.errorMessage = 'Review the highlighted fields before saving.';
      return;
    }

    this.isSaving = true;
    const payload = this.buildPayload();
    const request = this.gameId
      ? this.adminService.updateGame(this.gameId, payload)
      : this.adminService.createGame(payload);

    request.subscribe({
      next: () => {
        void this.router.navigate(['/admin/games']);
      },
      error: (error) => {
        this.validationErrors = extractLaravelValidationErrors(error);
        this.errorMessage = requestErrorMessage(error, 'The game could not be saved.');
        this.isSaving = false;
      },
      complete: () => {
        this.isSaving = false;
      },
    });
  }

  fillSlug(): void {
    const slugControl = this.form.controls.slug;

    if (!slugControl.value?.trim()) {
      slugControl.setValue(this.slugify(this.form.controls.name.value || ''));
    }
  }

  field(name: keyof typeof this.form.controls): AbstractControl {
    return this.form.controls[name];
  }

  serverErrorsFor(field: string): string[] {
    return validationMessagesFor(this.validationErrors, field);
  }

  private loadFormData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      genres: this.adminService.getGenres({ pageSize: 100 }),
      platforms: this.adminService.getPlatforms({ pageSize: 100 }),
      game: this.gameId ? this.adminService.getGame(this.gameId) : of(null),
    }).subscribe({
      next: ({ genres, platforms, game }) => {
        this.genres = genres.results;
        this.platforms = platforms.results;

        if (game) {
          this.patchGame(game);
        }
      },
      error: (error) => {
        this.errorMessage = requestErrorMessage(error, 'The game editor could not be loaded.');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  private patchGame(game: AdminGame): void {
    this.form.patchValue({
      name: game.name,
      slug: game.slug,
      background_image: game.background_image || '',
      description_raw: game.description_raw || '',
      website: game.website || '',
      released: game.released || '',
      rating: game.rating,
      metacritic: game.metacritic,
      playtime: game.playtime,
      genre_ids: game.genres.map((genre) => genre.id),
      platform_ids: game.platforms.map((item) => this.platformId(item)),
      developers: this.namedValuesToText(game.developers),
      publishers: this.namedValuesToText(game.publishers),
      tags: this.namedValuesToText(game.tags),
      screenshots: game.screenshots
        .map((item) => (typeof item === 'string' ? item : item.image))
        .join('\n'),
    });
  }

  private buildPayload(): AdminGamePayload {
    const value = this.form.getRawValue();

    return {
      name: value.name?.trim() || '',
      slug: value.slug?.trim() || '',
      background_image: value.background_image?.trim() || null,
      description_raw: value.description_raw?.trim() || '',
      website: value.website?.trim() || null,
      released: value.released || null,
      rating: Number(value.rating),
      metacritic: value.metacritic === null ? null : Number(value.metacritic),
      playtime: Number(value.playtime),
      genre_ids: value.genre_ids || [],
      platform_ids: value.platform_ids || [],
      developers: this.lines(value.developers || ''),
      publishers: this.lines(value.publishers || ''),
      tags: this.lines(value.tags || ''),
      screenshots: this.lines(value.screenshots || ''),
    };
  }

  private lines(value: string): string[] {
    return [
      ...new Set(
        value
          .split(/\r?\n/)
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    ];
  }

  private namedValuesToText(values: Array<AdminNamedValue | string>): string {
    return values.map((item) => (typeof item === 'string' ? item : item.name)).join('\n');
  }

  private platformId(item: AdminPlatform | AdminPlatformWrapper): number {
    return 'platform' in item ? item.platform.id : item.id;
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
