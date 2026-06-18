import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';

import { GameService } from '../../core/services/game.service';
import { Game } from '../../models/game.model';
import { Genre } from '../../models/genre.model';
import { Platform } from '../../models/platform.model';
import { ErrorMessage } from '../../shared/components/error-message/error-message';
import { FilterPanel, GameFilterValues } from '../../shared/components/filter-panel/filter-panel';
import { GameCard } from '../../shared/components/game-card/game-card';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';
import { SearchBar } from '../../shared/components/search-bar/search-bar';

@Component({
  selector: 'app-games',
  imports: [CommonModule, SearchBar, FilterPanel, GameCard, LoadingSpinner, ErrorMessage],
  templateUrl: './games.html',
  styleUrl: './games.css',
})
export class Games implements OnInit {
  games: Game[] = [];
  genres: Genre[] = [];
  platforms: Platform[] = [];

  isLoading = false;
  isLoadingMore = false;
  hasError = false;
  errorMessage = '';
  nextPageUrl: string | null = null;

  private readonly pageSize = 12;
  private page = 1;
  private searchText = '';
  private filters: GameFilterValues = {
    genreId: '',
    platformId: '',
    ordering: '-rating'
  };

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.loadFilterOptions();
    this.loadGames(true);
  }

  onSearch(searchText: string): void {
    this.searchText = searchText;
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
    this.loadGames(this.games.length === 0);
  }

  trackByGameId(_: number, game: Game): number {
    return game.id;
  }

  private loadFilterOptions(): void {
    forkJoin({
      genres: this.gameService.getGenres(),
      platforms: this.gameService.getPlatforms()
    }).subscribe({
      next: ({ genres, platforms }) => {
        this.genres = genres.results;
        this.platforms = platforms.results;
      },
      error: () => {
        this.genres = [];
        this.platforms = [];
      }
    });
  }

  private loadGames(reset: boolean): void {
    if (reset) {
      this.page = 1;
      this.games = [];
      this.isLoading = true;
    } else {
      this.isLoadingMore = true;
    }

    this.hasError = false;

    this.gameService
      .getFilteredGames(
        this.searchText,
        this.filters.genreId,
        this.filters.platformId,
        this.filters.ordering,
        this.page,
        this.pageSize
      )
      .subscribe({
        next: (response) => {
          this.games = reset ? response.results : [...this.games, ...response.results];
          this.nextPageUrl = response.next;
          this.page += 1;
        },
        error: () => {
          this.hasError = true;
          this.errorMessage = 'Game catalog is temporarily unavailable. Please try again in a moment.';
          this.isLoading = false;
          this.isLoadingMore = false;
        },
        complete: () => {
          this.isLoading = false;
          this.isLoadingMore = false;
        }
      });
  }
}
