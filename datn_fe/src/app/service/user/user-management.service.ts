import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiUrl = 'http://localhost:8080/api/user/';
  private uploadUrl = 'http://localhost:8080/api/upload';

  constructor(private http: HttpClient) { }

  /**
   * Get all users with filtering and pagination
   */
  getAllUsers(filter: any): Observable<any> {
    return this.http.post(`${this.apiUrl}search`, filter);
  }

  /**
   * Get user by ID
   */
  getUserById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}${id}`);
  }

  /**
   * Create new user
   */
  createUser(user: any): Observable<any> {
    return this.http.post(this.apiUrl, user);
  }

  /**
   * Update user
   */
  updateUser(user: any): Observable<any> {
    return this.http.put(this.apiUrl, user);
  }

  /**
   * Delete user by ID
   */
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}`);
  }

  /**
   * Delete multiple users
   */
  deleteUsers(ids: number[]): Observable<any> {
    return this.http.request('delete', this.apiUrl, { body: ids });
  }

  /**
   * Upload image file
   */
  uploadImage(formData: FormData): Observable<any> {
    return this.http.post(`${this.uploadUrl}/image`, formData);
  }
}

