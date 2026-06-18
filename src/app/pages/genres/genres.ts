import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { GameService } from '../../core/services/game.service';
import { Genre } from '../../models/genre.model';
import { ErrorMessage } from '../../shared/components/error-message/error-message';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-genres',
  imports: [CommonModule, RouterLink, LoadingSpinner, ErrorMessage],
  templateUrl: './genres.html',
  styleUrl: './genres.css',
})
export class Genres implements OnInit {
  genres: Genre[] = [];
  isLoading = true;
  hasError = false;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.loadGenres();
  }

  loadGenres(): void {
    this.isLoading = true;
    this.hasError = false;

    this.gameService.getGenres().subscribe({
      next: (response) => {
        this.genres = response.results;
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
