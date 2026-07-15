import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';

import { GameService } from '../../core/services/game.service';
import { GameDetails as GameDetailsModel, Screenshot } from '../../models/game.model';
import { ErrorMessage } from '../../shared/components/error-message/error-message';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';
import { RatingBadge } from '../../shared/components/rating-badge/rating-badge';
import { PlaytimePipe } from '../../shared/pipes/playtime.pipe';
import { ReleaseDatePipe } from '../../shared/pipes/release-date.pipe';

@Component({
  selector: 'app-game-details',
  imports: [CommonModule, RouterLink, LoadingSpinner, ErrorMessage, RatingBadge, PlaytimePipe, ReleaseDatePipe],
  templateUrl: './game-details.html',
  styleUrl: './game-details.css',
})
export class GameDetails implements OnInit {
  game: GameDetailsModel | null = null;
  screenshots: Screenshot[] = [];
  isLoading = true;
  hasError = false;
  errorMessage = '';

  private gameId: number | null = null;
  private loadRequestId = 0;

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
        this.errorMessage = 'This game could not be found.';
        return;
      }

      this.gameId = id;
      this.loadGame(id);
    });
  }

  retry(): void {
    if (this.gameId) {
      this.loadGame(this.gameId);
    }
  }

  private loadGame(id: number): void {
    const requestId = ++this.loadRequestId;
    this.isLoading = true;
    this.hasError = false;

    forkJoin({
      game: this.gameService.getGameById(id),
      screenshots: this.gameService.getGameScreenshots(id).pipe(
        catchError(() => of({ count: 0, next: null, previous: null, results: [] }))
      )
    }).subscribe({
      next: ({ game, screenshots }) => {
        if (requestId !== this.loadRequestId) {
          return;
        }

        this.game = game;
        this.screenshots = screenshots.results;
      },
      error: () => {
        if (requestId !== this.loadRequestId) {
          return;
        }

        this.hasError = true;
        this.errorMessage = 'Game details are temporarily unavailable. Please try again.';
        this.isLoading = false;
      },
      complete: () => {
        if (requestId !== this.loadRequestId) {
          return;
        }

        this.isLoading = false;
      }
    });
  }
}
