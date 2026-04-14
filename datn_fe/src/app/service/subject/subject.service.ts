import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private apiUrl = 'http://localhost:8080/api/subject';

  constructor(private http: HttpClient) { }

  /**
   * Get all subjects with filtering and pagination
   */
  getAllSubjects(filter: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/search`, filter);
  }

  /**
   * Get subject by ID
   */
  getSubjectById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new subject
   */
  createSubject(subject: any): Observable<any> {
    return this.http.post(this.apiUrl, subject);
  }

  /**
   * Update subject
   */
  updateSubject(subject: any): Observable<any> {
    return this.http.put(this.apiUrl, subject);
  }

  /**
   * Delete subject by ID
   */
  deleteSubject(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Delete multiple subjects
   */
  deleteSubjects(ids: number[]): Observable<any> {
    return this.http.request('delete', this.apiUrl, { body: ids });
  }
}

