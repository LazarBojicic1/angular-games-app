import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LibraryService } from '../../core/services/library.service';
import { Game } from '../../models/game.model';
import { GameCard } from '../../shared/components/game-card/game-card';
import { ErrorMessage } from '../../shared/components/error-message/error-message';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-play-later',
  imports: [CommonModule, RouterLink, GameCard, ErrorMessage, LoadingSpinner],
  templateUrl: './play-later.html',
  styleUrl: './play-later.css',
})
export class PlayLater implements OnInit {
  playLaterGames: Game[] = [];
  isLoading = true;
  hasError = false;

  constructor(private libraryService: LibraryService) {}

  ngOnInit(): void {
    this.refreshPlayLater();
  }

  refreshPlayLater(): void {
    this.isLoading = true;
    this.hasError = false;

    this.libraryService.getPlayLater().subscribe({
      next: (games) => {
        this.playLaterGames = games;
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
