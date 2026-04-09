import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Combo, ComboFilterRequest } from '../../model/combo.model';

@Injectable({
  providedIn: 'root'
})
export class ComboService {
  private apiUrl = 'http://localhost:8080/api/combo';

  constructor(private http: HttpClient) { }

  /**
   * Get all combos with filtering and pagination
   */
  getAllCombos(filter: ComboFilterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/search`, filter);
  }

  /**
   * Get combo by ID
   */
  getComboById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new combo
   */
  createCombo(combo: any): Observable<any> {
    return this.http.post(this.apiUrl, combo);
  }

  /**
   * Update combo
   */
  updateCombo(combo: any): Observable<any> {
    return this.http.put(this.apiUrl, combo);
  }

  /**
   * Delete combo by ID
   */
  deleteCombo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Delete multiple combos
   */
  deleteCombos(ids: number[]): Observable<any> {
    return this.http.request('delete', this.apiUrl, { body: ids });
  }
}

