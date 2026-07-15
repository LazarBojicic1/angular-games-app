import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, Subject, finalize, forkJoin, map, takeUntil, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Game } from '../../models/game.model';

interface LibraryResponse {
  results: Game[];
}

type LibraryType = 'favorites' | 'play-later';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  private readonly apiUrl = `${environment.apiUrl}/library`;
  private readonly favoriteGames = signal<Game[]>([]);
  private readonly queuedGames = signal<Game[]>([]);
  private readonly loadError = signal<string | null>(null);
  private readonly cancelRequests$ = new Subject<void>();
  private loaded = false;
  private loading = false;
  private activeUserId: number | null = null;

  readonly favorites = this.favoriteGames.asReadonly();
  readonly playLater = this.queuedGames.asReadonly();
  readonly error = this.loadError.asReadonly();

  constructor(private http: HttpClient) {}

  getFavorites(): Observable<Game[]> {
    return this.getList('favorites').pipe(
      tap((games) => this.favoriteGames.set(games))
    );
  }

  addToFavorites(game: Game): Observable<void> {
    return this.addToList('favorites', game).pipe(
      tap(() => this.favoriteGames.update((games) => this.prependUnique(games, game)))
    );
  }

  removeFromFavorites(gameId: number): Observable<void> {
    return this.removeFromList('favorites', gameId).pipe(
      tap(() => this.favoriteGames.update((games) => games.filter((game) => game.id !== gameId)))
    );
  }

  isFavorite(gameId: number): boolean {
    return this.favoriteGames().some((game) => game.id === gameId);
  }

  getPlayLater(): Observable<Game[]> {
    return this.getList('play-later').pipe(
      tap((games) => this.queuedGames.set(games))
    );
  }

  addToPlayLater(game: Game): Observable<void> {
    return this.addToList('play-later', game).pipe(
      tap(() => this.queuedGames.update((games) => this.prependUnique(games, game)))
    );
  }

  removeFromPlayLater(gameId: number): Observable<void> {
    return this.removeFromList('play-later', gameId).pipe(
      tap(() => this.queuedGames.update((games) => games.filter((game) => game.id !== gameId)))
    );
  }

  isInPlayLater(gameId: number): boolean {
    return this.queuedGames().some((game) => game.id === gameId);
  }

  ensureLoaded(userId: number): void {
    if (this.activeUserId !== userId) {
      this.cancelRequests$.next();
      this.clearState();
      this.activeUserId = userId;
    }

    if (this.loaded || this.loading) {
      return;
    }

    this.loading = true;
    this.loadError.set(null);
    const requestedUserId = userId;

    forkJoin({
      favorites: this.getFavorites(),
      playLater: this.getPlayLater()
    }).pipe(
      takeUntil(this.cancelRequests$),
      finalize(() => {
        if (this.activeUserId === requestedUserId) {
          this.loading = false;
        }
      })
    ).subscribe({
      next: () => {
        if (this.activeUserId === requestedUserId) {
          this.loaded = true;
        }
      },
      error: () => {
        if (this.activeUserId === requestedUserId) {
          this.loadError.set('Your saved games could not be loaded. Please try again.');
        }
      }
    });
  }

  reset(): void {
    this.cancelRequests$.next();
    this.activeUserId = null;
    this.clearState();
  }

  private clearState(): void {
    this.favoriteGames.set([]);
    this.queuedGames.set([]);
    this.loadError.set(null);
    this.loaded = false;
    this.loading = false;
  }

  private getList(type: LibraryType): Observable<Game[]> {
    return this.http.get<LibraryResponse>(`${this.apiUrl}/${type}`).pipe(
      takeUntil(this.cancelRequests$),
      map((response) => response.results)
    );
  }

  private addToList(type: LibraryType, game: Game): Observable<void> {
    return this.http.put<unknown>(`${this.apiUrl}/${type}/${game.id}`, {}).pipe(
      takeUntil(this.cancelRequests$),
      map(() => undefined)
    );
  }

  private removeFromList(type: LibraryType, gameId: number): Observable<void> {
    return this.http.delete<unknown>(`${this.apiUrl}/${type}/${gameId}`).pipe(
      takeUntil(this.cancelRequests$),
      map(() => undefined)
    );
  }

  private prependUnique(games: Game[], game: Game): Game[] {
    return games.some((savedGame) => savedGame.id === game.id) ? games : [game, ...games];
  }
}
