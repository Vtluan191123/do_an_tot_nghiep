import { Injectable, inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../service/auth/auth.service';
import { catchError, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Check if user has a token
    const token = this.authService.getToken();

    if (!token) {
      // No token, redirect to login
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    // Check if token is expired
    if (this.authService.isTokenExpired()) {
      // Token expired, try to refresh
      const refreshToken = this.authService.getRefreshToken();
      if (!refreshToken) {
        // No refresh token, go to login
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
      }

      // Try to refresh token (synchronously for guard)
      // Note: This is a limitation - we can't do async operations in sync guard
      // So we just check if refresh token exists and is not expired
      if (this.authService.isRefreshTokenExpired()) {
        // Refresh token also expired, must login again
        this.authService.logout().subscribe(() => {
          this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        });
        return false;
      }

      // Refresh token exists and not expired - allow for now
      // The interceptor will handle the actual refresh before request
      return true;
    }

    // Token exists and not expired
    return true;
  }
}

/**
 * Functional guard for newer Angular versions
 * This can be applied to routes via canActivate: [authGuard]
 */
export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user has a token
  const token = authService.getToken();

  if (!token) {
    // No token, redirect to login
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Check if token is expired
  if (authService.isTokenExpired()) {
    // Token expired, try to refresh
    const refreshToken = authService.getRefreshToken();
    if (!refreshToken || authService.isRefreshTokenExpired()) {
      // No refresh token or refresh token expired, must login again
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    // Refresh token exists and not expired - allow for now
    // The interceptor will handle the actual refresh before request
    return true;
  }

  // Token exists and not expired
  return true;
};



