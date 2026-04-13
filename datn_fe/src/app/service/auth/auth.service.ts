import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth'; // Adjust based on your backend URL

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<any>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Login user
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this.setToken(response.accessToken);
          if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
          }
          this.isAuthenticatedSubject.next(true);
        }),
        switchMap(() => {
          // After login, get user profile info
          return this.getProfile();
        }),
        tap(userResponse => {
          if (userResponse.user) {
            this.setUserInStorage(userResponse.user);
            this.currentUserSubject.next(userResponse.user);
          } else if (userResponse.username) {
            // If response is user object directly
            this.setUserInStorage(userResponse);
            this.currentUserSubject.next(userResponse);
          }
        }),
        catchError(error => {
          console.error('Login failed:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Register new user
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data)
      .pipe(
        tap(response => {
          // Store tokens
          this.setToken(response.accessToken);
          if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
          }
          this.isAuthenticatedSubject.next(true);
        }),
        switchMap(() => {
          // After register, get user profile info
          return this.getProfile();
        }),
        tap(userResponse => {
          if (userResponse.user) {
            this.setUserInStorage(userResponse.user);
            this.currentUserSubject.next(userResponse.user);
          } else if (userResponse.username) {
            // If response is user object directly
            this.setUserInStorage(userResponse);
            this.currentUserSubject.next(userResponse);
          }
        }),
        catchError(error => {
          console.error('Registration failed:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Logout user
   */
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {})
      .pipe(
        tap(() => {
          this.removeToken();
          this.removeUserFromStorage();
          this.currentUserSubject.next(null);
          this.isAuthenticatedSubject.next(false);
        }),
        catchError(error => {
          console.error('Logout failed:', error);
          // Still clear local data even if API fails
          this.removeToken();
          this.removeUserFromStorage();
          this.currentUserSubject.next(null);
          this.isAuthenticatedSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.hasToken();
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  /**
   * Set token in localStorage
   */
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  /**
   * Remove token from localStorage
   */
  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  /**
   * Check if token exists
   */
  private hasToken(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;
  }

  /**
   * Set user in localStorage
   */
  setUserInStorage(user: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }

  /**
   * Get user from localStorage
   */
  getUserFromStorage(): any {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  /**
   * Remove user from localStorage
   */
  removeUserFromStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  /**
   * Refresh token (if backend supports it)
   */
  refreshToken(refreshToken: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/refresh`, { refreshToken })
      .pipe(
        tap(response => {
          if (response.accessToken) {
            this.setToken(response.accessToken);
          }
        }),
        catchError(error => {
          console.error('Token refresh failed:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Update user profile using UserController API
   */
  updateProfile(profileData: any): Observable<any> {
    // Get current user ID from stored user
    const currentUser = this.getUserFromStorage();
    if (!currentUser || !currentUser.id) {
      return throwError(() => new Error('User ID not found'));
    }

    // Add the user ID to the profile data for the API request
    const updateRequest = {
      ...profileData,
      id: currentUser.id
    };

    // Call UserController PUT endpoint at /api/user/
    return this.http.put('/api/user/', updateRequest)
      .pipe(
        tap((response: any) => {
          // Handle both wrapped and direct responses
          const updatedUser = response.data || response.user || response;
          
          if (updatedUser && updatedUser.id) {
            this.setUserInStorage(updatedUser);
            this.currentUserSubject.next(updatedUser);
          }
        }),
        catchError(error => {
          console.error('Profile update failed:', error);
          return throwError(() => error);
        })
      );
  }
  /**
   * Get user profile
   */
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`)
      .pipe(
        tap((response:any) => {
          if (response.user) {
            this.setUserInStorage(response.user);
            this.currentUserSubject.next(response.user);
          }
        }),
        catchError(error => {
          console.error('Get profile failed:', error);
          return throwError(() => error);
        })
      );
  }
}

