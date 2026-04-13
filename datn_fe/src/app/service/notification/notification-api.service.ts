import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from './notification-client.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationApiService {

  private apiUrl = '/api/notification';

  constructor(private http: HttpClient) { }

  /**
   * Lấy tất cả thông báo
   */
  getNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  /**
   * Lấy thông báo có phân trang
   */
  getNotificationsWithPagination(page: number = 1, size: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/paginated?page=${page}&size=${size}`);
  }

  /**
   * Lấy thông báo chưa đọc
   */
  getUnreadNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/unread`);
  }

  /**
   * Đếm số thông báo chưa đọc
   */
  countUnreadNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/unread/count`);
  }

  /**
   * Đánh dấu thông báo là đã đọc
   */
  markAsRead(notificationId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${notificationId}/read`, {});
  }

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   */
  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/read-all`, {});
  }

  /**
   * Xóa thông báo
   */
  deleteNotification(notificationId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${notificationId}`);
  }

  /**
   * Xóa tất cả thông báo
   */
  deleteAllNotifications(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-all`);
  }

  /**
   * Lấy thông báo theo loại
   */
  getNotificationsByType(type: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/type/${type}`);
  }
}

