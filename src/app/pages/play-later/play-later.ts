import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LibraryService } from '../../core/services/library.service';
import { Game } from '../../models/game.model';
import { GameCard } from '../../shared/components/game-card/game-card';

@Component({
  selector: 'app-play-later',
  imports: [CommonModule, RouterLink, GameCard],
  templateUrl: './play-later.html',
  styleUrl: './play-later.css',
})
export class PlayLater implements OnInit {
  playLaterGames: Game[] = [];

  constructor(private libraryService: LibraryService) {}

  ngOnInit(): void {
    this.refreshPlayLater();
  }

  refreshPlayLater(): void {
    this.playLaterGames = this.libraryService.getPlayLater();
  }
}
