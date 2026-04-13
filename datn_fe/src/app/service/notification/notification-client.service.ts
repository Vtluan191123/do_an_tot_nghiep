import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: number;
  type: 'MESSAGE' | 'FRIEND_REQUEST' | 'FRIEND_ACCEPTED' | 'OTHER';
  userSendId: number;
  userSendName: string;
  userSendUsername: string;
  userSendAvatar: string;
  title: string;
  content: string;
  relatedEntityId: number;
  isRead: boolean;
  createdAt: string;
  readAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationClientService {

  // List thông báo
  private notifications$ = new BehaviorSubject<Notification[]>([]);

  // Thông báo chưa đọc
  private unreadCount$ = new BehaviorSubject<number>(0);

  // Thông báo mới nhất (dùng để show toast)
  private latestNotification$ = new BehaviorSubject<Notification | null>(null);

  constructor() { }

  /**
   * Lấy observable list thông báo
   */
  getNotifications$(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  /**
   * Lấy observable số thông báo chưa đọc
   */
  getUnreadCount$(): Observable<number> {
    return this.unreadCount$.asObservable();
  }

  /**
   * Lấy observable thông báo mới nhất
   */
  getLatestNotification$(): Observable<Notification | null> {
    return this.latestNotification$.asObservable();
  }

  /**
   * Thêm thông báo mới vào list
   */
  addNotification(notification: Notification): void {
    const current = this.notifications$.value;
    this.notifications$.next([notification, ...current]);

    // Tăng unread count
    if (!notification.isRead) {
      this.unreadCount$.next(this.unreadCount$.value + 1);
    }

    // Set thông báo mới nhất
    this.latestNotification$.next(notification);
  }

  /**
   * Cập nhật danh sách thông báo
   */
  setNotifications(notifications: Notification[]): void {
    this.notifications$.next(notifications);

    // Tính unread count
    const unreadCount = notifications.filter(n => !n.isRead).length;
    this.unreadCount$.next(unreadCount);
  }

  /**
   * Đánh dấu thông báo là đã đọc
   */
  markAsRead(notificationId: number): void {
    const current = this.notifications$.value.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    this.notifications$.next(current);

    // Giảm unread count
    const unreadCount = current.filter(n => !n.isRead).length;
    this.unreadCount$.next(unreadCount);
  }

  /**
   * Xóa thông báo
   */
  removeNotification(notificationId: number): void {
    const current = this.notifications$.value.filter(n => n.id !== notificationId);
    this.notifications$.next(current);

    // Cập nhật unread count
    const unreadCount = current.filter(n => !n.isRead).length;
    this.unreadCount$.next(unreadCount);
  }

  /**
   * Xóa tất cả thông báo
   */
  clearAllNotifications(): void {
    this.notifications$.next([]);
    this.unreadCount$.next(0);
    this.latestNotification$.next(null);
  }

  /**
   * Lấy current notifications value
   */
  getNotificationsValue(): Notification[] {
    return this.notifications$.value;
  }

  /**
   * Lấy current unread count value
   */
  getUnreadCountValue(): number {
    return this.unreadCount$.value;
  }
}

