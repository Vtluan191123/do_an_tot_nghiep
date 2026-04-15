// combo-filter.service.ts - Service cho dropdown combo subject

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ComboSubjectDropdown, ComboFilterRequestWithSubject } from '../model/combo-filter.model';

export interface ResponseDto<T> {
  status: number;
  data: T;
  count?: number;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComboFilterService {

  private apiUrl = '/api/combo';
  private subjectsCache: ComboSubjectDropdown[] | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Lấy danh sách subject có trong combo cho dropdown
   */
  getSubjectsForDropdown(): Observable<ResponseDto<ComboSubjectDropdown[]>> {
    // Kiểm tra cache trước
    if (this.subjectsCache) {
      return of({
        status: 200,
        data: this.subjectsCache,
        count: this.subjectsCache.length
      });
    }

    return this.http.get<ResponseDto<ComboSubjectDropdown[]>>(
      `${this.apiUrl}/subjects/dropdown`
    ).pipe(
      // Cache kết quả
      tap(response => {
        if (response.status === 200) {
          this.subjectsCache = response.data;
        }
      })
    );
  }

  /**
   * Tìm kiếm combo với filter (có thể chứa subjectId hoặc subjectName)
   */
  searchCombos(filter: ComboFilterRequestWithSubject): Observable<ResponseDto<any[]>> {
    return this.http.post<ResponseDto<any[]>>(
      `${this.apiUrl}/search`,
      filter
    );
  }

  /**
   * Xóa cache (dùng khi thêm/sửa/xóa combo hoặc subject)
   */
  invalidateSubjectsCache(): void {
    this.subjectsCache = null;
  }
}

