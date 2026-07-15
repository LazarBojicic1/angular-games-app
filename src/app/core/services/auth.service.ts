import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, finalize, map, of, shareReplay, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthResponse, LoginCredentials, RegisterPayload } from '../../models/auth.model';
import { User, getUserRoleName } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'gameVault:authToken';
  private readonly authUrl = `${environment.apiUrl.replace(/\/$/, '')}/auth`;
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);

  private currentUserRequest$: Observable<User | null> | null = null;

  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  get token(): string | null {
    return this.readToken();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return Boolean(this.token);
  }

  get isAdmin(): boolean {
    return getUserRoleName(this.currentUser) === 'admin';
  }

  login(credentials: LoginCredentials): Observable<User> {
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, credentials).pipe(
      tap((response) => this.startSession(response)),
      map((response) => response.user)
    );
  }

  register(payload: RegisterPayload): Observable<User> {
    return this.http.post<AuthResponse>(`${this.authUrl}/register`, payload).pipe(
      tap((response) => this.startSession(response)),
      map((response) => response.user)
    );
  }

  logout(): Observable<void> {
    if (!this.token) {
      this.clearSession();
      return of(undefined);
    }

    return this.http.post<void>(`${this.authUrl}/logout`, {}).pipe(
      finalize(() => this.clearSession())
    );
  }

  loadCurrentUser(force = false): Observable<User | null> {
    if (!this.token) {
      this.currentUserSubject.next(null);
      return of(null);
    }

    if (this.currentUser && !force) {
      return of(this.currentUser);
    }

    if (this.currentUserRequest$) {
      return this.currentUserRequest$;
    }

    this.currentUserRequest$ = this.http.get<User>(`${this.authUrl}/me`).pipe(
      tap((user) => this.currentUserSubject.next(user)),
      map((user) => user as User | null),
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && [401, 403].includes(error.status)) {
          this.clearSession();
        }

        return of(null);
      }),
      finalize(() => {
        this.currentUserRequest$ = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    return this.currentUserRequest$;
  }

  clearSession(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(this.tokenKey);
    }

    this.currentUserSubject.next(null);
  }

  private startSession(response: AuthResponse): void {
    const token = response.token || response.access_token;

    if (!token) {
      throw new Error('Authentication response did not contain an access token.');
    }

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(this.tokenKey, token);
    }

    this.currentUserSubject.next(response.user);
  }

  private readToken(): string | null {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }

    return sessionStorage.getItem(this.tokenKey);
  }
}
