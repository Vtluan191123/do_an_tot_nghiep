import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/api/booking`;

  constructor(private http: HttpClient) { }

  /**
   * Get all bookings with filtering and pagination
   */
  getAllBookings(filter: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/search`, filter);
  }

  /**
   * Get all bookings with joined data (user, subject, timeslot information)
   */
  getAllBookingsWithJoin(filter: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/search-with-join`, filter);
  }

  /**
   * Get booking by ID
   */
  getBookingById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new booking
   */
  createBooking(booking: any): Observable<any> {
    return this.http.post(this.apiUrl, booking);
  }

  /**
   * Update booking
   */
  updateBooking(booking: any): Observable<any> {
    return this.http.put(this.apiUrl, booking);
  }

  /**
   * Delete booking by ID
   */
  deleteBooking(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Delete multiple bookings
   */
  deleteBookings(ids: number[]): Observable<any> {
    return this.http.request('delete', this.apiUrl, { body: ids });
  }
}

