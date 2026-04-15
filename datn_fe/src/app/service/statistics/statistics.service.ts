import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private apiUrl = `${environment.apiUrl}/api/statistics`;

  constructor(private http: HttpClient) { }

  /**
   * Get revenue statistics
   */
  getRevenueStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/revenue`);
  }

  /**
   * Get top combo purchases
   */
  getTopCombos(limit: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/top-combos`, { params: { limit: limit.toString() } });
  }

  /**
   * Get top subject purchases
   */
  getTopSubjects(limit: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/top-subjects`, { params: { limit: limit.toString() } });
  }

  /**
   * Get all statistics summary
   */
  getStatisticsSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/summary`);
  }
}

