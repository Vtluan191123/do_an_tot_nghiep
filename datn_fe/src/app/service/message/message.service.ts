import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import * as http from 'node:http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private api = '/api/message';

  constructor(private http: HttpClient) {}

  // gửi tin nhắn
  send(message: any, files: File[] = []): Observable<any> {

    const formData = new FormData();

    // message JSON
    formData.append(
      'message',
      new Blob([JSON.stringify(message)], { type: 'application/json' })
    );

    // files
    files.forEach(file => {
      formData.append('files', file);
    });

    return this.http.post(`${this.api}/send`, formData);
  }

  // update message
  update(message: any): Observable<any> {
    return this.http.put(`${this.api}/update`, message);
  }

  // lấy danh sách message
  gets(groudId: string): Observable<any> {
    return this.http.get(`${this.api}/gets`, {
      params: { groudId }
    });
  }

  // delete message
  delete(messageId: string): Observable<any> {
    return this.http.delete(`${this.api}/delete`, {
      params: { messageId }
    });
  }
}
