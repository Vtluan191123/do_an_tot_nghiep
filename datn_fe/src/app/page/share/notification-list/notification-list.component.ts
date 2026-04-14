import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../service/notification/notification.service';
import { NotificationApiService } from '../../../service/notification/notification-api.service';
import { SafeHtmlPipe } from '../pipe/pipe-html.pipe';
import {BASE_URL_UPLOAD} from '../../../constants/constants';
import { Router } from '@angular/router';
import { FriendProfileModalComponent } from '../../friend-search/friend-profile-modal/friend-profile-modal.component';
import { FriendSearchService } from '../../../service/friend/friend-search.service';
import { TransferDataService } from '../../../service/tranfer-data/transfer-data.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, SafeHtmlPipe, FriendProfileModalComponent],
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit, OnChanges {
  @Input() notifications: any[] = [];

  isLoading = false;

  // For profile modal
  showProfileModal = false;
  selectedUserProfile: any = null;

  constructor(
    private notificationService: NotificationService,
    private notificationApiService: NotificationApiService,
    private router: Router,
    private friendSearchService: FriendSearchService,
    private transferDataService: TransferDataService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // If no notifications passed from parent, load from API
    if (!this.notifications || this.notifications.length === 0) {
      this.loadNotifications();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['notifications']) {
      // When notifications change, update the list
      this.notifications = changes['notifications'].currentValue || [];
    }
  }

  /**
   * Load notifications from API
   */
  loadNotifications(): void {
    this.isLoading = true;
    this.notificationApiService.getNotifications().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.notifications = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.isLoading = false;
      }
    });
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'FRIEND_REQUEST':
        return '👥';
      case 'MESSAGE':
        return '💬';
      case 'FRIEND_ACCEPTED':
        return '✅';
      default:
        return '🔔';
    }
  }

  getNotificationTypeLabel(type: string): string {
    switch (type) {
      case 'FRIEND_REQUEST':
        return 'Lời mời kết bạn';
      case 'MESSAGE':
        return 'Tin nhắn';
      case 'FRIEND_ACCEPTED':
        return 'Chấp nhận kết bạn';
      default:
        return 'Thông báo';
    }
  }

  onNotificationClick(notification: any): void {
    // Mark as read if not already read
    if (!notification.isRead) {
      this.notificationApiService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.isRead = true;
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
        }
      });
    }

    // Navigate or show modal based on notification type
    if (notification.type === 'MESSAGE' && notification.relatedEntityId) {
      // MESSAGE type: navigate to message-detail with groudId
      const groudId = notification.relatedEntityId;
      console.log('Navigate to message detail with groudId:', groudId);
      // Decrease unread message count
      this.transferDataService.decreaseUnreadMessageCount(groudId);
      this.router.navigate(['/message-detail', { groudId: groudId }]);
    } else if (notification.type === 'FRIEND_REQUEST' && notification.userSendId) {
      // FRIEND_REQUEST type: Show modal profile của userSendId
      console.log('Show profile modal for userSendId:', notification.userSendId);
      this.loadAndShowUserProfile(notification.userSendId);
    } else if (notification.type === 'FRIEND_ACCEPTED' && notification.userSendId) {
      // FRIEND_ACCEPTED type: Show modal profile của userSendId
      console.log('Show profile modal for userSendId:', notification.userSendId);
      this.loadAndShowUserProfile(notification.userSendId);
    }
  }

  /**
   * Load user profile and show modal
   */
  loadAndShowUserProfile(userId: number): void {
    // Use FriendSearchService to get friend profile with proper mapping
    this.friendSearchService.getFriendProfile(userId.toString()).subscribe({
      next: (profile: any) => {
        if (profile && profile.id) {
          this.selectedUserProfile = profile;
          this.showProfileModal = true;
          console.log('User profile loaded:', this.selectedUserProfile);
        }
      },
      error: (error: any) => {
        console.error('Error loading user profile:', error);
      }
    });
  }

  /**
   * Close profile modal
   */
  closeProfileModal(): void {
    this.showProfileModal = false;
    this.selectedUserProfile = null;
  }

  /**
   * Handle addFriend event from modal
   */
  onAddFriendFromModal(friendId: string): void {
    console.log('Friend request sent from modal to:', friendId);
    // Update the user profile in modal to show pending state
    if (this.selectedUserProfile) {
      this.selectedUserProfile.statusFriend = 0;
      this.selectedUserProfile.sentByMe = true;
    }
  }

  /**
   * Handle message event from modal
   */
  onMessageFromModal(friendId: string): void {
    console.log('Message clicked from modal for friendId:', friendId);
    // Navigate to message or show message UI
    // For now, just close the modal
    this.closeProfileModal();
  }

  deleteNotification(id: number, event: Event): void {
    event.stopPropagation();

    // Find the notification to get its type
    const notification = this.notifications.find(n => n.id === id);

    this.notificationApiService.deleteNotification(id).subscribe({
      next: () => {
        // Remove from local list
        this.notifications = this.notifications.filter(n => n.id !== id);

        // If it's a MESSAGE notification, decrease unread message count
        if (notification && notification.type === 'MESSAGE' && notification.relatedEntityId) {
          this.transferDataService.decreaseUnreadMessageCount(notification.relatedEntityId);
          console.log('Decreased unread message count for:', notification.relatedEntityId);
        }
      },
      error: (error) => {
        console.error('Error deleting notification:', error);
      }
    });
  }

  markAllAsRead(): void {
    this.notificationApiService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true);
      },
      error: (error) => {
        console.error('Error marking all as read:', error);
      }
    });
  }

  clearAllNotifications(): void {
    this.notificationApiService.deleteAllNotifications().subscribe({
      next: () => {
        this.notifications = [];
      },
      error: (error) => {
        console.error('Error clearing notifications:', error);
      }
    });
  }

  getTimeAgo(date: string | Date | any): string {
    if (!date) {
      return 'Không xác định';
    }

    try {
      // Convert string hoặc LocalDateTime object từ backend thành Date
      const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);

      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid date:', date);
        return 'Không xác định';
      }

      const now = new Date();
      const diff = now.getTime() - dateObj.getTime();

      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'Vừa xong';
      if (minutes < 60) return `${minutes} phút trước`;
      if (hours < 24) return `${hours} giờ trước`;
      if (days < 7) return `${days} ngày trước`;

      return dateObj.toLocaleDateString('vi-VN');
    } catch (error) {
      console.error('Error parsing date:', date, error);
      return 'Không xác định';
    }
  }

  /**
   * Handle image load error - fallback to initials
   */
  onImageError(event: any): void {
    event.target.style.display = 'none';
  }

  protected readonly BASE_URL_UPLOAD = BASE_URL_UPLOAD;
}

