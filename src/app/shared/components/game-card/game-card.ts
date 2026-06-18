import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LibraryService } from '../../../core/services/library.service';
import { Game } from '../../../models/game.model';
import { RatingBadge } from '../rating-badge/rating-badge';

@Component({
  selector: 'app-game-card',
  imports: [CommonModule, RouterLink, RatingBadge],
  templateUrl: './game-card.html',
  styleUrl: './game-card.css'
})
export class GameCard implements OnChanges {
  @Input({ required: true }) game!: Game;
  @Input() compact = false;
  @Output() libraryChange = new EventEmitter<void>();

  isFavorite = false;
  isPlayLater = false;

  constructor(private libraryService: LibraryService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['game'] && this.game) {
      this.refreshLibraryState();
    }
  }

  toggleFavorite(): void {
    if (this.isFavorite) {
      this.libraryService.removeFromFavorites(this.game.id);
    } else {
      this.libraryService.addToFavorites(this.game);
    }

    this.refreshLibraryState();
    this.libraryChange.emit();
  }

  togglePlayLater(): void {
    if (this.isPlayLater) {
      this.libraryService.removeFromPlayLater(this.game.id);
    } else {
      this.libraryService.addToPlayLater(this.game);
    }

    this.refreshLibraryState();
    this.libraryChange.emit();
  }

  private refreshLibraryState(): void {
    this.isFavorite = this.libraryService.isFavorite(this.game.id);
    this.isPlayLater = this.libraryService.isInPlayLater(this.game.id);
  }
}
