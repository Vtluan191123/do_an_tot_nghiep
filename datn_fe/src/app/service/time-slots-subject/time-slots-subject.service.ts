import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TimeSlotsSubject {
  id?: number;
  subjectId: number;
  timeSlotsId: number;
  maxCapacity: number;
  currentCapacity: number;
  trainingMethods: string; // Online or Offline
  coachId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimeSlots {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TimeSlotsSubjectService {
  private apiUrl = `${environment.apiUrl}/api/time-slots-subject`;

  constructor(private http: HttpClient) {}

  /**
   * Get all time slots for a coach
   */
  getByCoachId(coachId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/coach/${coachId}`);
  }

  /**
   * Get time slots for a coach and subject
   */
  getByCoachIdAndSubjectId(coachId: number, subjectId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/coach/${coachId}/subject/${subjectId}`);
  }

  /**
   * Get a specific time slot by ID
   */
  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  /**
   * Update a time slot (maxCapacity, currentCapacity, trainingMethod)
   */
  update(request: { id: number; maxCapacity?: number; currentCapacity?: number; trainingMethods?: string }): Observable<any> {
    return this.http.put(this.apiUrl, request);
  }

  /**
   * Create time slots for a coach and subject
   */
  createForCoachAndSubject(coachId: number, subjectId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/coach/${coachId}/subject/${subjectId}`, {});
  }

  /**
   * Delete time slots for a coach
   */
  deleteByCoachId(coachId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/coach/${coachId}`);
  }

  /**
   * Delete time slots for a subject
   */
  deleteBySubjectId(subjectId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/subject/${subjectId}`);
  }

  /**
   * Get time slots for coach with pagination and filtering
   */
  getCoachTimeSlotsWithPagination(request: {
    coachId: number;
    page?: number;
    size?: number;
    date?: string;
    trainingMethods?: string;
    status?: string;
    subjectId?: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/coach/filter`, request);
  }
}
