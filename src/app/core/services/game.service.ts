import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import { Game, GameDetails, Screenshot } from '../../models/game.model';
import { Genre } from '../../models/genre.model';
import { Platform } from '../../models/platform.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getGames(page: number = 1, pageSize: number = 12): Observable<ApiResponse<Game>> {
    const params = new HttpParams()
      .set('page', page)
      .set('page_size', pageSize)
      .set('ordering', '-rating');

    return this.http.get<ApiResponse<Game>>(`${this.apiUrl}/games`, { params });
  }

  searchGames(searchText: string, page: number = 1, pageSize: number = 12): Observable<ApiResponse<Game>> {
    const params = new HttpParams()
      .set('search', searchText)
      .set('page', page)
      .set('page_size', pageSize);

    return this.http.get<ApiResponse<Game>>(`${this.apiUrl}/games`, { params });
  }

  getFilteredGames(
    searchText: string,
    genreId: string,
    platformId: string,
    ordering: string,
    page: number = 1,
    pageSize: number = 12
  ): Observable<ApiResponse<Game>> {
    let params = new HttpParams()
      .set('page', page)
      .set('page_size', pageSize);

    if (searchText.trim()) {
      params = params.set('search', searchText.trim());
    }

    if (genreId) {
      params = params.set('genres', genreId);
    }

    if (platformId) {
      params = params.set('platforms', platformId);
    }

    if (ordering) {
      params = params.set('ordering', ordering);
    }

    return this.http.get<ApiResponse<Game>>(`${this.apiUrl}/games`, { params });
  }

  getGameById(id: number): Observable<GameDetails> {
    return this.http.get<GameDetails>(`${this.apiUrl}/games/${id}`);
  }

  getGameScreenshots(id: number): Observable<ApiResponse<Screenshot>> {
    return this.http.get<ApiResponse<Screenshot>>(`${this.apiUrl}/games/${id}/screenshots`);
  }

  getGenres(): Observable<ApiResponse<Genre>> {
    return this.http.get<ApiResponse<Genre>>(`${this.apiUrl}/genres`);
  }

  getGamesByGenre(genreId: number, page: number = 1, pageSize: number = 12): Observable<ApiResponse<Game>> {
    const params = new HttpParams()
      .set('genres', genreId)
      .set('page', page)
      .set('page_size', pageSize);

    return this.http.get<ApiResponse<Game>>(`${this.apiUrl}/games`, { params });
  }

  getPlatforms(): Observable<ApiResponse<Platform>> {
    const params = new HttpParams()
      .set('page_size', 20);

    return this.http.get<ApiResponse<Platform>>(`${this.apiUrl}/platforms`, { params });
  }

  getGamesByPlatform(platformId: number, page: number = 1, pageSize: number = 12): Observable<ApiResponse<Game>> {
    const params = new HttpParams()
      .set('platforms', platformId)
      .set('page', page)
      .set('page_size', pageSize);

    return this.http.get<ApiResponse<Game>>(`${this.apiUrl}/games`, { params });
  }
}
