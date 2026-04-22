import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AiTrainingQuestionService {
  private apiUrl = `${environment.apiUrl}/api/ai-training/question`;

  constructor(private http: HttpClient) { }

  /**
   * Get all questions with filtering and pagination
   */
  getAllQuestions(filter: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/search`, filter);
  }

  /**
   * Get question by ID
   */
  getQuestionById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new question
   */
  createQuestion(question: any): Observable<any> {
    return this.http.post(this.apiUrl, question);
  }

  /**
   * Update question
   */
  updateQuestion(question: any): Observable<any> {
    return this.http.put(this.apiUrl, question);
  }

  /**
   * Delete question by ID
   */
  deleteQuestion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Delete multiple questions
   */
  deleteQuestions(ids: number[]): Observable<any> {
    return this.http.request('delete', this.apiUrl, { body: ids });
  }
}

