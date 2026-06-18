import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LibraryService } from '../../core/services/library.service';
import { Game } from '../../models/game.model';
import { GameCard } from '../../shared/components/game-card/game-card';

@Component({
  selector: 'app-favorites',
  imports: [CommonModule, RouterLink, GameCard],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
})
export class Favorites implements OnInit {
  favorites: Game[] = [];

  constructor(private libraryService: LibraryService) {}

  ngOnInit(): void {
    this.refreshFavorites();
  }

  refreshFavorites(): void {
    this.favorites = this.libraryService.getFavorites();
  }
}
