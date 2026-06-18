import { Injectable } from '@angular/core';

import { Game } from '../../models/game.model';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  private readonly favoritesKey = 'gameVault:favorites';
  private readonly playLaterKey = 'gameVault:playLater';

  getFavorites(): Game[] {
    return this.readGames(this.favoritesKey);
  }

  addToFavorites(game: Game): void {
    this.addGame(this.favoritesKey, game);
  }

  removeFromFavorites(gameId: number): void {
    this.removeGame(this.favoritesKey, gameId);
  }

  isFavorite(gameId: number): boolean {
    return this.getFavorites().some((game) => game.id === gameId);
  }

  getPlayLater(): Game[] {
    return this.readGames(this.playLaterKey);
  }

  addToPlayLater(game: Game): void {
    this.addGame(this.playLaterKey, game);
  }

  removeFromPlayLater(gameId: number): void {
    this.removeGame(this.playLaterKey, gameId);
  }

  isInPlayLater(gameId: number): boolean {
    return this.getPlayLater().some((game) => game.id === gameId);
  }

  private addGame(key: string, game: Game): void {
    const games = this.readGames(key);

    if (games.some((savedGame) => savedGame.id === game.id)) {
      return;
    }

    this.writeGames(key, [game, ...games]);
  }

  private removeGame(key: string, gameId: number): void {
    this.writeGames(
      key,
      this.readGames(key).filter((game) => game.id !== gameId)
    );
  }

  private readGames(key: string): Game[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    const storedValue = localStorage.getItem(key);

    if (!storedValue) {
      return [];
    }

    try {
      const parsedValue = JSON.parse(storedValue);
      return Array.isArray(parsedValue) ? parsedValue : [];
    } catch {
      return [];
    }
  }

  private writeGames(key: string, games: Game[]): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(key, JSON.stringify(games));
  }
}
