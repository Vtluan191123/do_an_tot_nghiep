import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TrainingRoom,
  TrainingRoomCreateRequest,
  TrainingRoomUpdateRequest,
  TrainingRoomFilterRequest
} from '../../model/training-room.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrainingRoomService {
  private apiUrl = `${environment.apiUrl}/api/training-room`;

  constructor(private http: HttpClient) { }

  /**
   * Get all training rooms
   */
  getAll(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
  }

  /**
   * Get training room by ID
   */
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get training room by timeSlots subject ID
   */
  getByTimeSlotsSubjectId(timeSlotsSubjectId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/timeslots-subject/${timeSlotsSubjectId}`);
  }

  /**
   * Get all training rooms for a coach
   */
  getByCoachId(coachId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/coach/${coachId}`);
  }

  /**
   * Get all active training rooms for a coach
   */
  getActiveByCoachId(coachId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/coach/${coachId}/active`);
  }

  /**
   * Get all training rooms for a subject
   */
  getBySubjectId(subjectId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/subject/${subjectId}`);
  }

  /**
   * Get training rooms by status
   */
  getByStatus(status: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/status/${status}`);
  }

  /**
   * Search and filter training rooms with pagination
   */
  search(request: TrainingRoomFilterRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/search`, request);
  }

  /**
   * Create a new training room
   */
  create(request: TrainingRoomCreateRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, request);
  }

  /**
   * Create training room for a timeSlot subject (auto-generation)
   */
  createForTimeSlotsSubject(timeSlotsSubjectId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/timeslots-subject/${timeSlotsSubjectId}`, {});
  }

  /**
   * Update training room
   */
  update(request: TrainingRoomUpdateRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}`, request);
  }

  /**
   * Delete training room
   */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get online training rooms for a user based on their enrolled subjects
   */
  getOnlineRoomsForUser(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * Get online training rooms for a user with pagination
   */
  getOnlineRoomsForUserPaginated(userId: number, page: number = 0, size: number = 20): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/${userId}/paginated?page=${page}&size=${size}`);
  }

  /**
   * Get online training rooms for a user by specific subject
   */
  getOnlineRoomsForUserBySubject(userId: number, subjectId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/${userId}/subject/${subjectId}`);
  }
}
