import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AiTrainingAnswerService {
  private apiUrl = `${environment.apiUrl}/api/ai-training/answer`;

  constructor(private http: HttpClient) { }

  /**
   * Get all answers with filtering and pagination
   */
  getAllAnswers(filter: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/search`, filter);
  }

  /**
   * Get answer by ID
   */
  getAnswerById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new answer
   */
  createAnswer(answer: any): Observable<any> {
    return this.http.post(this.apiUrl, answer);
  }

  /**
   * Update answer
   */
  updateAnswer(answer: any): Observable<any> {
    return this.http.put(this.apiUrl, answer);
  }

  /**
   * Delete answer by ID
   */
  deleteAnswer(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Delete multiple answers
   */
  deleteAnswers(ids: number[]): Observable<any> {
    return this.http.request('delete', this.apiUrl, { body: ids });
  }
}

