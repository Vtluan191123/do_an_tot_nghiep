import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {


  private api = '/api/friend';

  constructor(private http: HttpClient) {}

  // gửi lời mời kết bạn
  addFriend(userAddId: number, userReceiverId: number): Observable<any> {
    const params = new HttpParams()
      .set('userAddId', userAddId)
      .set('userReceiverId', userReceiverId);

    return this.http.post(`${this.api}/add`, null, { params });
  }

  // chấp nhận kết bạn
  acceptFriend(userAddId: number, userReceiverId: number): Observable<any> {
    const params = new HttpParams()
      .set('userAddId', userAddId)
      .set('userReceiverId', userReceiverId);

    return this.http.put(`${this.api}/accept`, null, { params });
  }

  // hủy kết bạn
  cancelFriend(userAddId: number, userReceiverId: number, groudId: string): Observable<any> {
    const params = new HttpParams()
      .set('userAddId', userAddId)
      .set('userReceiverId', userReceiverId)
      .set('groudId', groudId);

    return this.http.post(`${this.api}/cancel`, null, { params });
  }

  // lấy danh sách group
  getListGroup(userId: number): Observable<any> {
    return this.http.get(`${this.api}/list_groud/${userId}`);
  }



}
