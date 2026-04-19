import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../service/auth/auth.service';
import { Router } from '@angular/router';
import { throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';

// Subject to handle token refresh queueing
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const authService = inject(AuthService);
  const router = inject(Router);

  // URLs that don't need authentication token
  const skipTokenUrls = ['/login', '/register', '/refresh'];

  // Check if request URL should skip token
  const shouldSkipToken = skipTokenUrls.some(url => req.url.includes(url));

  // If URL should skip token or is not browser, proceed without token
  if (shouldSkipToken || !isPlatformBrowser(platformId)) {
    return next(req);
  }

  // Get current token
  let token = authService.getToken();

  // Check if token is expired (with 30 second buffer)
  if (token && authService.isTokenExpired(30)) {
    // Token is expired, try to refresh
    const refreshToken = authService.getRefreshToken();

    if (refreshToken && !authService.isRefreshTokenExpired()) {
      // Refresh token exists and not expired, proceed with refresh
      if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return authService.refreshToken(refreshToken).pipe(
          switchMap((response: any) => {
            isRefreshing = false;

            // Get new token
            const newToken = authService.getToken();
            refreshTokenSubject.next(newToken);

            // Retry original request with new token
            return next(addTokenToRequest(req, newToken));
          }),
          catchError((error) => {
            isRefreshing = false;

            // Refresh token failed, logout user
            authService.logout().subscribe(() => {
              router.navigate(['/login']);
            });

            return throwError(() => error);
          })
        );
      } else {
        // Refresh is in progress, wait for new token
        return refreshTokenSubject.pipe(
          filter(token => token != null),
          take(1),
          switchMap(newToken => {
            return next(addTokenToRequest(req, newToken));
          })
        );
      }
    } else {
      // No refresh token or refresh token expired, logout
      authService.logout().subscribe(() => {
        router.navigate(['/login']);
      });
      return throwError(() => new Error('Token expired and cannot be refreshed'));
    }
  }

  // Token is not expired, proceed normally
  if (token) {
    req = addTokenToRequest(req, token);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors
      if (error.status === 401) {
        // Token might have become invalid, logout user
        authService.logout().subscribe(() => {
          router.navigate(['/login']);
        });
      }

      return throwError(() => error);
    })
  );
};

/**
 * Helper function to add token to request headers
 */
function addTokenToRequest(req: any, token: string | null): any {
  if (!token) {
    return req;
  }

  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

