import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const apiUrl = environment.apiUrl.replace(/\/$/, '');
  const isApiRequest = request.url === apiUrl || request.url.startsWith(`${apiUrl}/`);
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.token;

  if (!isApiRequest || !token || request.headers.has('Authorization')) {
    return next(request);
  }

  const authenticatedRequest = request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authenticatedRequest).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        authService.clearSession();

        const isAuthEndpoint = request.url.startsWith(`${apiUrl}/auth/`);
        const isProtectedPage = ['/admin', '/favorites', '/play-later'].some(
          (path) => router.url === path || router.url.startsWith(`${path}/`)
        );

        if (!isAuthEndpoint && isProtectedPage) {
          void router.navigate(['/login'], {
            queryParams: { returnUrl: router.url }
          });
        }
      }

      return throwError(() => error);
    })
  );
};
