import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  private api = '/api/auth';

  constructor(private http: HttpClient) {}

  // gửi tin nhắn
  getInfoUser(): Observable<any> {
  return this.http.get(`${this.api}/get_info`);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }
}
