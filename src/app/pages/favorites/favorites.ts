import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LibraryService } from '../../core/services/library.service';
import { Game } from '../../models/game.model';
import { GameCard } from '../../shared/components/game-card/game-card';
import { ErrorMessage } from '../../shared/components/error-message/error-message';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-favorites',
  imports: [CommonModule, RouterLink, GameCard, ErrorMessage, LoadingSpinner],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
})
export class Favorites implements OnInit {
  favorites: Game[] = [];
  isLoading = true;
  hasError = false;

  constructor(private libraryService: LibraryService) {}

  ngOnInit(): void {
    this.refreshFavorites();
  }

  refreshFavorites(): void {
    this.isLoading = true;
    this.hasError = false;

    this.libraryService.getFavorites().subscribe({
      next: (games) => {
        this.favorites = games;
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
