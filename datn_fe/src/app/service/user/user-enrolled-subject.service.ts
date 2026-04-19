import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnrolledSubject } from '../../model/enrolled-subject.model';

@Injectable({
  providedIn: 'root'
})
export class UserEnrolledSubjectService {

  private api = '/api/user';

  constructor(private http: HttpClient) { }

  /**
   * Get enrolled subjects for a user
   * @param userId User ID
   * @returns Observable of enrolled subjects list
   */
  getEnrolledSubjects(userId: number): Observable<any> {
    return this.http.get<any>(`${this.api}/${userId}/enrolled-subjects`);
  }
}

