import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { GameService } from '../../core/services/game.service';
import { Game } from '../../models/game.model';
import { Genre } from '../../models/genre.model';
import { Platform } from '../../models/platform.model';
import { ErrorMessage } from '../../shared/components/error-message/error-message';
import { FilterPanel, GameFilterValues } from '../../shared/components/filter-panel/filter-panel';
import { GameCard } from '../../shared/components/game-card/game-card';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-platforms',
  imports: [CommonModule, FilterPanel, GameCard, LoadingSpinner, ErrorMessage],
  templateUrl: './platforms.html',
  styleUrl: './platforms.css',
})
export class Platforms implements OnInit {
  platforms: Platform[] = [];
  genres: Genre[] = [];
  selectedPlatform: Platform | null = null;
  games: Game[] = [];

  isLoadingPlatforms = true;
  isLoadingGames = false;
  isLoadingMore = false;
  hasError = false;
  nextPageUrl: string | null = null;

  private readonly pageSize = 12;
  private page = 1;
  private filters: GameFilterValues = {
    genreId: '',
    platformId: '',
    ordering: '-rating'
  };

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.loadPlatforms();
  }

  selectPlatform(platform: Platform): void {
    if (this.selectedPlatform?.id === platform.id) {
      return;
    }

    this.selectedPlatform = platform;
    this.filters = {
      genreId: '',
      platformId: '',
      ordering: '-rating'
    };
    this.loadGames(true);
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
    if (this.selectedPlatform) {
      this.loadGames(this.games.length === 0);
      return;
    }

    this.loadPlatforms();
  }

  private loadPlatforms(): void {
    this.isLoadingPlatforms = true;
    this.hasError = false;

    this.gameService.getPlatforms().subscribe({
      next: (response) => {
        this.platforms = response.results;
        this.selectedPlatform = this.platforms[0] || null;

        if (this.selectedPlatform) {
          this.loadGames(true);
        }
      },
      error: () => {
        this.hasError = true;
        this.isLoadingPlatforms = false;
      },
      complete: () => {
        this.isLoadingPlatforms = false;
      }
    });

    this.gameService.getGenres().subscribe({
      next: (response) => {
        this.genres = response.results;
      },
      error: () => {
        this.genres = [];
      }
    });
  }

  private loadGames(reset: boolean): void {
    if (!this.selectedPlatform) {
      return;
    }

    if (reset) {
      this.page = 1;
      this.games = [];
      this.isLoadingGames = true;
    } else {
      this.isLoadingMore = true;
    }

    this.hasError = false;

    this.gameService.getFilteredGames(
      '',
      this.filters.genreId,
      String(this.selectedPlatform.id),
      this.filters.ordering,
      this.page,
      this.pageSize
    ).subscribe({
      next: (response) => {
        this.games = reset ? response.results : [...this.games, ...response.results];
        this.nextPageUrl = response.next;
        this.page += 1;
      },
      error: () => {
        this.hasError = true;
        this.isLoadingGames = false;
        this.isLoadingMore = false;
      },
      complete: () => {
        this.isLoadingGames = false;
        this.isLoadingMore = false;
      }
    });
  }
}
