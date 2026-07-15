import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { LibraryService } from '../../../core/services/library.service';
import { Game } from '../../../models/game.model';
import { ReleaseDatePipe } from '../../pipes/release-date.pipe';
import { RatingBadge } from '../rating-badge/rating-badge';

@Component({
  selector: 'app-game-card',
  imports: [CommonModule, RouterLink, RatingBadge, ReleaseDatePipe],
  templateUrl: './game-card.html',
  styleUrl: './game-card.css'
})
export class GameCard {
  @Input({ required: true }) game!: Game;
  @Input() compact = false;
  @Output() libraryChange = new EventEmitter<void>();

  isUpdatingFavorite = false;
  isUpdatingPlayLater = false;
  actionError = '';

  constructor(
    private readonly libraryService: LibraryService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  get isFavorite(): boolean {
    return this.libraryService.isFavorite(this.game.id);
  }

  get isPlayLater(): boolean {
    return this.libraryService.isInPlayLater(this.game.id);
  }

  toggleFavorite(): void {
    if (!this.requireAuthentication()) {
      return;
    }

    if (this.isUpdatingFavorite) {
      return;
    }

    this.isUpdatingFavorite = true;
    this.actionError = '';
    const request = this.isFavorite
      ? this.libraryService.removeFromFavorites(this.game.id)
      : this.libraryService.addToFavorites(this.game);

    request.pipe(
      finalize(() => {
        this.isUpdatingFavorite = false;
      })
    ).subscribe({
      next: () => {
        this.libraryChange.emit();
      },
      error: () => {
        this.actionError = "We couldn't update your library. Please try again.";
      }
    });
  }

  togglePlayLater(): void {
    if (!this.requireAuthentication()) {
      return;
    }

    if (this.isUpdatingPlayLater) {
      return;
    }

    this.isUpdatingPlayLater = true;
    this.actionError = '';
    const request = this.isPlayLater
      ? this.libraryService.removeFromPlayLater(this.game.id)
      : this.libraryService.addToPlayLater(this.game);

    request.pipe(
      finalize(() => {
        this.isUpdatingPlayLater = false;
      })
    ).subscribe({
      next: () => {
        this.libraryChange.emit();
      },
      error: () => {
        this.actionError = "We couldn't update your library. Please try again.";
      }
    });
  }

  private requireAuthentication(): boolean {
    if (this.authService.isAuthenticated) {
      return true;
    }

    void this.router.navigate(['/login'], {
      queryParams: { returnUrl: this.router.url }
    });
    return false;
  }
}
