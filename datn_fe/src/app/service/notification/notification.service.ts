import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'message' | 'friend_request' | 'class';
  title: string;
  description?: string;
  avatar?: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  relatedId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor() {
    this.loadMockNotifications();
  }

  // Load mock notifications for demo
  private loadMockNotifications(): void {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'friend_request',
        title: 'Nguyễn Văn A',
        description: 'gửi cho bạn một lời mời kết bạn',
        avatar: 'assets/img/hero/hero-1.jpg',
        timestamp: new Date(Date.now() - 5 * 60000),
        isRead: false,
        relatedId: '1'
      },
      {
        id: '2',
        type: 'message',
        title: 'Trần Thị B',
        description: 'đã gửi cho bạn một tin nhắn',
        avatar: 'assets/img/hero/hero-2.jpg',
        timestamp: new Date(Date.now() - 15 * 60000),
        isRead: false,
        relatedId: '2'
      },
      {
        id: '3',
        type: 'class',
        title: 'Lớp Yoga Sáng',
        description: 'bắt đầu trong 30 phút',
        avatar: 'assets/img/classes/class-1.jpg',
        timestamp: new Date(Date.now() - 30 * 60000),
        isRead: false,
        relatedId: '3'
      },
      {
        id: '4',
        type: 'friend_request',
        title: 'Phạm Văn C',
        description: 'gửi cho bạn một lời mời kết bạn',
        avatar: 'assets/img/hero/hero-3.jpg',
        timestamp: new Date(Date.now() - 60 * 60000),
        isRead: true,
        relatedId: '4'
      }
    ];

    this.notificationsSubject.next(mockNotifications);
    this.updateUnreadCount();
  }

  getNotifications(): Observable<Notification[]> {
    return this.notifications$;
  }

  addNotification(notification: Notification): void {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...current]);
    this.updateUnreadCount();
  }

  markAsRead(id: string): void {
    const current = this.notificationsSubject.value;
    const updated = current.map(notif =>
      notif.id === id ? { ...notif, isRead: true } : notif
    );
    this.notificationsSubject.next(updated);
    this.updateUnreadCount();
  }

  markAllAsRead(): void {
    const current = this.notificationsSubject.value;
    const updated = current.map(notif => ({ ...notif, isRead: true }));
    this.notificationsSubject.next(updated);
    this.updateUnreadCount();
  }

  deleteNotification(id: string): void {
    const current = this.notificationsSubject.value;
    const filtered = current.filter(notif => notif.id !== id);
    this.notificationsSubject.next(filtered);
    this.updateUnreadCount();
  }

  clearAll(): void {
    this.notificationsSubject.next([]);
    this.updateUnreadCount();
  }

  private updateUnreadCount(): void {
    const unreadCount = this.notificationsSubject.value.filter(n => !n.isRead).length;
    this.unreadCountSubject.next(unreadCount);
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$;
  }
}

