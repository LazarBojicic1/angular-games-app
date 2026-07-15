import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AdminGame } from '../../models/admin.model';
import { AdminService } from '../../services/admin.service';
import { requestErrorMessage } from '../../shared/admin-validation';

@Component({
  selector: 'app-admin-games',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-games.html',
  styleUrls: ['../../admin-shared.css', './admin-games.css'],
})
export class AdminGames implements OnInit {
  readonly searchControl = new FormControl('', { nonNullable: true });

  games: AdminGame[] = [];
  count = 0;
  page = 1;
  readonly pageSize = 15;
  nextPageUrl: string | null = null;
  previousPageUrl: string | null = null;
  isLoading = true;
  deletingId: number | null = null;
  errorMessage = '';
  successMessage = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadGames();
  }

  search(): void {
    this.loadGames(1);
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.loadGames(1);
  }

  previousPage(): void {
    if (this.previousPageUrl && this.page > 1) {
      this.loadGames(this.page - 1);
    }
  }

  nextPage(): void {
    if (this.nextPageUrl) {
      this.loadGames(this.page + 1);
    }
  }

  deleteGame(game: AdminGame): void {
    if (
      typeof window !== 'undefined' &&
      !window.confirm(`Delete “${game.name}”? This action cannot be undone.`)
    ) {
      return;
    }

    this.deletingId = game.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminService.deleteGame(game.id).subscribe({
      next: () => {
        this.successMessage = `“${game.name}” was deleted.`;
        const targetPage = this.games.length === 1 && this.page > 1 ? this.page - 1 : this.page;
        this.loadGames(targetPage, false);
      },
      error: (error) => {
        this.errorMessage = requestErrorMessage(error, 'The game could not be deleted.');
        this.deletingId = null;
      },
      complete: () => {
        this.deletingId = null;
      },
    });
  }

  genreNames(game: AdminGame): string {
    return game.genres.map((genre) => genre.name).join(', ') || '—';
  }

  platformNames(game: AdminGame): string {
    return (
      game.platforms
        .map((item) => ('platform' in item ? item.platform.name : item.name))
        .join(', ') || '—'
    );
  }

  loadGames(page: number = this.page, resetMessages = true): void {
    this.isLoading = true;
    this.errorMessage = '';

    if (resetMessages) {
      this.successMessage = '';
    }

    this.adminService
      .getGames({
        page,
        pageSize: this.pageSize,
        search: this.searchControl.value,
      })
      .subscribe({
        next: (response) => {
          this.games = response.results;
          this.count = response.count;
          this.nextPageUrl = response.next;
          this.previousPageUrl = response.previous;
          this.page = page;
        },
        error: (error) => {
          this.errorMessage = requestErrorMessage(error, 'Games could not be loaded.');
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }
}
