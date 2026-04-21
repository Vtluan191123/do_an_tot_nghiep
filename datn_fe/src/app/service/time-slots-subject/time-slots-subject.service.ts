import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TimeSlotsSubject {
  id?: number;
  subjectId: number;
  subjectName?: string;
  timeSlotsId: number;
  maxCapacity: number;
  currentCapacity: number;
  trainingMethods: string; // Online or Offline
  coachId: number;
  coachFullName?: string;
  createdAt?: string;
  updatedAt?: string;
  // TimeSlots information
  date?: string;        // YYYY-MM-DD format
  startTime?: string;   // HH:mm format or ISO datetime
  endTime?: string;     // HH:mm format or ISO datetime
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
    coachId?: number;
    page?: number;
    size?: number;
    date?: string;
    subjectName?: string;
    trainingMethods?: string;
    status?: string;
    subjectId?: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/coach/filter`, request);
  }

  /**
   * Get coach's weekly schedule with pagination
   * weekNumber: 0 = current week, 1 = next week, -1 = previous week, etc.
   */
  getCoachWeeklySchedule(coachId: number, weekNumber: number = 0): Observable<any> {
    return this.http.get(`${this.apiUrl}/coach/${coachId}/weekly?weekNumber=${weekNumber}`);
  }

  /**
   * Get all available timeslots for a subject with pagination
   */
  getTimeslotsForSubject(subjectId: number, page: number = 0, size: number = 100): Observable<any> {
    return this.http.get(`${this.apiUrl}/subject/${subjectId}?page=${page}&size=${size}`);
  }
}
