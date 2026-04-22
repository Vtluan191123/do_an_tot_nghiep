import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AiTrainingTopicService {
  private apiUrl = `${environment.apiUrl}/api/ai-training/topic`;

  constructor(private http: HttpClient) { }

  /**
   * Get all topics with filtering and pagination
   */
  getAllTopics(filter: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/search`, filter);
  }

  /**
   * Get topic by ID
   */
  getTopicById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new topic
   */
  createTopic(topic: any): Observable<any> {
    return this.http.post(this.apiUrl, topic);
  }

  /**
   * Update topic
   */
  updateTopic(topic: any): Observable<any> {
    return this.http.put(this.apiUrl, topic);
  }

  /**
   * Delete topic by ID
   */
  deleteTopic(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Delete multiple topics
   */
  deleteTopics(ids: number[]): Observable<any> {
    return this.http.request('delete', this.apiUrl, { body: ids });
  }
}

