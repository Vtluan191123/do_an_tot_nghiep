import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  private api = '/api/auth';

  constructor(private http: HttpClient,
              private authService: AuthService) {}

  /**
   * Get current user info
   */
  getInfoUser(): Observable<any> {
    return this.http.get(`${this.api}/get_info`);
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  /**
   * Get current user profile
   */
  getProfile(): Observable<any> {
    return this.authService.getProfile();
  }

  /**
   * Logout user
   */
  logout(): Observable<any> {
    return this.authService.logout();
  }
}
