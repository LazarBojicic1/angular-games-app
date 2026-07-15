import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { GameService } from '../../core/services/game.service';
import { Game } from '../../models/game.model';
import { Platform } from '../../models/platform.model';
import { ErrorMessage } from '../../shared/components/error-message/error-message';
import { FilterPanel, GameFilterValues } from '../../shared/components/filter-panel/filter-panel';
import { GameCard } from '../../shared/components/game-card/game-card';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-genre-games',
  imports: [CommonModule, RouterLink, FilterPanel, GameCard, LoadingSpinner, ErrorMessage],
  templateUrl: './genre-games.html',
  styleUrl: './genre-games.css',
})
export class GenreGames implements OnInit {
  games: Game[] = [];
  platforms: Platform[] = [];
  genreName = 'Selected genre';
  isLoading = true;
  isLoadingMore = false;
  hasError = false;
  nextPageUrl: string | null = null;

  private readonly pageSize = 12;
  private page = 1;
  private loadRequestId = 0;
  genreId: number | null = null;
  private filters: GameFilterValues = {
    genreId: '',
    platformId: '',
    ordering: '-rating'
  };

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));

      if (!id) {
        this.hasError = true;
        this.isLoading = false;
        return;
      }

      this.genreId = id;
      this.resolveGenreName(id);
      this.loadPlatforms();
      this.loadGames(true);
    });
  }

  onFiltersChange(filters: GameFilterValues): void {
    this.filters = filters;
    this.loadGames(true);
  }

  loadMore(): void {
    if (!this.nextPageUrl || this.isLoadingMore) {
      return;
    }

    this.loadGames(false);
  }

  retry(): void {
    this.loadGames(this.games.length === 0);
  }

  private resolveGenreName(id: number): void {
    this.gameService.getGenres().subscribe({
      next: (response) => {
        if (this.genreId === id) {
          this.genreName = response.results.find((genre) => genre.id === id)?.name || this.genreName;
        }
      },
      error: () => {
        if (this.genreId === id) {
          this.genreName = 'Selected genre';
        }
      }
    });
  }

  private loadPlatforms(): void {
    this.gameService.getPlatforms().subscribe({
      next: (response) => {
        this.platforms = response.results;
      },
      error: () => {
        this.platforms = [];
      }
    });
  }

  private loadGames(reset: boolean): void {
    if (!this.genreId) {
      return;
    }

    const requestId = ++this.loadRequestId;

    if (reset) {
      this.page = 1;
      this.games = [];
      this.isLoading = true;
    } else {
      this.isLoadingMore = true;
    }

    this.hasError = false;

    this.gameService.getFilteredGames(
      '',
      String(this.genreId),
      this.filters.platformId,
      this.filters.ordering,
      this.page,
      this.pageSize
    ).subscribe({
      next: (response) => {
        if (requestId !== this.loadRequestId) {
          return;
        }

        this.games = reset ? response.results : [...this.games, ...response.results];
        this.nextPageUrl = response.next;
        this.page += 1;
      },
      error: () => {
        if (requestId !== this.loadRequestId) {
          return;
        }

        this.hasError = true;
        this.isLoading = false;
        this.isLoadingMore = false;
      },
      complete: () => {
        if (requestId !== this.loadRequestId) {
          return;
        }

        this.isLoading = false;
        this.isLoadingMore = false;
      }
    });
  }
}
