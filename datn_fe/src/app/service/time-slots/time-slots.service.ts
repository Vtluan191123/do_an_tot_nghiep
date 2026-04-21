import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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
export class TimeSlotsService {
  private apiUrl = `${environment.apiUrl}/api/time-slots`;

  constructor(private http: HttpClient) {}

  /**
   * Get all time slots
   */
  getAllTimeSlots(page: number = 0, size: number = 1000): Observable<any> {
    return this.http.get(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  /**
   * Get all time slots (alias)
   */
  getAll(page: number = 0, size: number = 1000): Observable<any> {
    return this.getAllTimeSlots(page, size);
  }

  /**
   * Get time slots by date
   * @param date Date in format YYYY-MM-DD
   */
  getByDate(date: string): Observable<any> {
    // Convert date format YYYY-MM-DD to YYYYMMDD (normDate)
    const normDate = date.replace(/-/g, '');
    return this.http.get(`${this.apiUrl}/by-date?normDate=${normDate}`);
  }

  /**
   * Get time slot by ID
   */
  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  /**
   * Create time slot
   */
  create(data: { date: string; startTime: string; endTime: string }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  /**
   * Update time slot
   */
  update(data: TimeSlots): Observable<any> {
    return this.http.put(this.apiUrl, data);
  }

  /**
   * Delete time slot
   */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}


