import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../service/notification/notification.service';
import { SafeHtmlPipe } from '../pipe/pipe-html.pipe';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, SafeHtmlPipe],
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit {
  notifications: Notification[] = [];
  isLoading = false;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.getNotifications().subscribe((data) => {
      this.notifications = data;
    });
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'friend_request':
        return '👥';
      case 'message':
        return '💬';
      case 'class':
        return '🏋️';
      default:
        return '🔔';
    }
  }

  getNotificationTypeLabel(type: string): string {
    switch (type) {
      case 'friend_request':
        return 'Lời mời kết bạn';
      case 'message':
        return 'Tin nhắn';
      case 'class':
        return 'Lớp học';
      default:
        return 'Thông báo';
    }
  }

  onNotificationClick(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id);
    }

    // Handle navigation based on notification type
    // This can be extended based on your routing needs
  }

  deleteNotification(id: string, event: Event): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(id);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  clearAllNotifications(): void {
    this.notificationService.clearAll();
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;

    return new Date(date).toLocaleDateString('vi-VN');
  }
}

