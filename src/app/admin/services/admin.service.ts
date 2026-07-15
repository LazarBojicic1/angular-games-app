import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AdminDashboardStats,
  AdminGame,
  AdminGamePayload,
  AdminGenre,
  AdminGenrePayload,
  AdminListQuery,
  AdminPagedResponse,
  AdminPlatform,
  AdminPlatformPayload,
  AdminRole,
  AdminRolePayload,
  AdminUser,
  AdminUserPayload,
} from '../models/admin.model';

type EntityResponse<T> = T | { data: T };
type CollectionResponse<T> = T[] | AdminPagedResponse<T> | { data: T[] };

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly apiUrl = `${this.resolveApiUrl()}/admin`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<AdminDashboardStats> {
    return this.http
      .get<EntityResponse<AdminDashboardStats>>(`${this.apiUrl}/dashboard`)
      .pipe(map((response) => this.unwrapEntity(response)));
  }

  getGames(query: AdminListQuery = {}): Observable<AdminPagedResponse<AdminGame>> {
    return this.http.get<AdminPagedResponse<AdminGame>>(`${this.apiUrl}/games`, {
      params: this.buildParams(query),
    });
  }

  getGame(id: number): Observable<AdminGame> {
    return this.http
      .get<EntityResponse<AdminGame>>(`${this.apiUrl}/games/${id}`)
      .pipe(map((response) => this.unwrapEntity(response)));
  }

  createGame(payload: AdminGamePayload): Observable<AdminGame> {
    return this.http
      .post<EntityResponse<AdminGame>>(`${this.apiUrl}/games`, payload)
      .pipe(map((response) => this.unwrapEntity(response)));
  }

  updateGame(id: number, payload: AdminGamePayload): Observable<AdminGame> {
    return this.http
      .put<EntityResponse<AdminGame>>(`${this.apiUrl}/games/${id}`, payload)
      .pipe(map((response) => this.unwrapEntity(response)));
  }

  deleteGame(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/games/${id}`);
  }

  getGenres(query: AdminListQuery = {}): Observable<AdminPagedResponse<AdminGenre>> {
    return this.http.get<AdminPagedResponse<AdminGenre>>(`${this.apiUrl}/genres`, {
      params: this.buildParams(query),
    });
  }

  createGenre(payload: AdminGenrePayload): Observable<AdminGenre> {
    return this.http
      .post<EntityResponse<AdminGenre>>(`${this.apiUrl}/genres`, payload)
      .pipe(map((response) => this.unwrapEntity(response)));
  }

  updateGenre(id: number, payload: AdminGenrePayload): Observable<AdminGenre> {
    return this.http
      .put<EntityResponse<AdminGenre>>(`${this.apiUrl}/genres/${id}`, payload)
      .pipe(map((response) => this.unwrapEntity(response)));
  }

  deleteGenre(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/genres/${id}`);
  }

  getPlatforms(query: AdminListQuery = {}): Observable<AdminPagedResponse<AdminPlatform>> {
    return this.http.get<AdminPagedResponse<AdminPlatform>>(`${this.apiUrl}/platforms`, {
      params: this.buildParams(query),
    });
  }

  createPlatform(payload: AdminPlatformPayload): Observable<AdminPlatform> {
    return this.http
      .post<EntityResponse<AdminPlatform>>(`${this.apiUrl}/platforms`, payload)
      .pipe(map((response) => this.unwrapEntity(response)));
  }

  updatePlatform(id: number, payload: AdminPlatformPayload): Observable<AdminPlatform> {
    return this.http
      .put<EntityResponse<AdminPlatform>>(`${this.apiUrl}/platforms/${id}`, payload)
      .pipe(map((response) => this.unwrapEntity(response)));
  }

  deletePlatform(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/platforms/${id}`);
  }

  getUsers(query: AdminListQuery = {}): Observable<AdminPagedResponse<AdminUser>> {
    return this.http.get<AdminPagedResponse<AdminUser>>(`${this.apiUrl}/users`, {
      params: this.buildParams(query),
    });
  }

  createUser(payload: AdminUserPayload): Observable<AdminUser> {
    return this.http
      .post<EntityResponse<AdminUser>>(`${this.apiUrl}/users`, payload)
      .pipe(map((response) => this.unwrapEntity(response)));
  }

  updateUser(id: number, payload: AdminUserPayload): Observable<AdminUser> {
    return this.http
      .put<EntityResponse<AdminUser>>(`${this.apiUrl}/users/${id}`, payload)
      .pipe(map((response) => this.unwrapEntity(response)));
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  getRoles(): Observable<AdminRole[]> {
    return this.http
      .get<CollectionResponse<AdminRole>>(`${this.apiUrl}/roles`, {
        params: new HttpParams().set('page_size', 100),
      })
      .pipe(map((response) => this.unwrapCollection(response)));
  }

  createRole(payload: AdminRolePayload): Observable<AdminRole> {
    return this.http
      .post<EntityResponse<AdminRole>>(`${this.apiUrl}/roles`, payload)
      .pipe(map((response) => this.unwrapEntity(response)));
  }

  updateRole(id: number, payload: AdminRolePayload): Observable<AdminRole> {
    return this.http
      .put<EntityResponse<AdminRole>>(`${this.apiUrl}/roles/${id}`, payload)
      .pipe(map((response) => this.unwrapEntity(response)));
  }

  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/roles/${id}`);
  }

  private resolveApiUrl(): string {
    const configuredUrl = (environment as { apiUrl?: string }).apiUrl || '/api';
    return configuredUrl.replace(/\/$/, '');
  }

  private buildParams(query: AdminListQuery): HttpParams {
    let params = new HttpParams();

    if (query.page) {
      params = params.set('page', query.page);
    }

    if (query.pageSize) {
      params = params.set('page_size', query.pageSize);
    }

    if (query.search?.trim()) {
      params = params.set('search', query.search.trim());
    }

    return params;
  }

  private unwrapEntity<T>(response: EntityResponse<T>): T {
    return this.hasDataProperty<T>(response) ? response.data : response;
  }

  private unwrapCollection<T>(response: CollectionResponse<T>): T[] {
    if (Array.isArray(response)) {
      return response;
    }

    if ('results' in response) {
      return response.results;
    }

    return response.data;
  }

  private hasDataProperty<T>(response: EntityResponse<T>): response is { data: T } {
    return typeof response === 'object' && response !== null && 'data' in response;
  }
}
