import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiUrl = `${environment.apiUrl}/api/user/`;
  private uploadUrl = `${environment.apiUrl}/api/upload`;
  private subjectUrl = `${environment.apiUrl}/api/subject`;

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
    return this.http.post(`${this.uploadUrl}`, formData);
  }

  /**
   * Get all roles
   */
  getAllRoles(): Observable<any> {
    return this.http.get(`${this.apiUrl}role`);
  }

  /**
   * Get all subjects
   */
  getAllSubjects(): Observable<any> {
    const filter = {
      page: 0,
      size: 1000,
      sortBy: 'id',
      sortDirection: 'DESC'
    };
    return this.http.post(`${this.subjectUrl}/search`, filter);
  }

  /**
   * Assign coach role with subjects
   */
  assignCoachRole(request: any): Observable<any> {
    return this.http.post(`${this.apiUrl}assign-coach-role`, request);
  }

  /**
   * Get user's coach subjects
   */
  getUserCoachSubjects(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}${userId}/coach-subjects`);
  }
}
