import { Component, OnInit, OnDestroy } from '@angular/core';
import {ListMessageComponent} from "../../message/list-message/list-message.component";
import {SafeHtmlPipe} from "../pipe/pipe-html.pipe";
import {ICON_MESSAGE, ICON_BELL} from '../other/icons/icons';
import {RouterLink, Router} from '@angular/router';
import {UserProfileDropdownComponent} from "../../dash-board/user-profile-dropdown/user-profile-dropdown.component";
import {NotificationListComponent} from "../notification-list/notification-list.component";
import {NotificationService} from "../../../service/notification/notification.service";
import {CommonModule} from '@angular/common';
import {TransferDataService} from "../../../service/tranfer-data/transfer-data.service";
import {WebsocketService} from "../../../service/socket/websocket.service";
import {AuthService} from "../../../service/auth/auth.service";
import {NotificationApiService} from "../../../service/notification/notification-api.service";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {IMessage} from "@stomp/stompjs";

export interface Notification {
  id: number;
  type: 'MESSAGE' | 'FRIEND_REQUEST' | 'FRIEND_ACCEPTED';
  userSendId: number;
  userSendName: string;
  userSendUsername: string;
  userSendAvatar: string;
  title: string;
  content: string;
  relatedEntityId: number;
  isRead: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [
    ListMessageComponent,
    SafeHtmlPipe,
    RouterLink,
    UserProfileDropdownComponent,
    NotificationListComponent,
    CommonModule
  ],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent implements OnInit, OnDestroy {

  isShowListMessage: boolean = false
  isShowNotification: boolean = false
  unreadCount: number = 0
  unreadMessageCount: number = 0
  notifications: Notification[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private transferDataService: TransferDataService,
    private websocketService: WebsocketService,
    private authService: AuthService,
    private notificationApiService: NotificationApiService
  ) {}

  ngOnInit(): void {
    // Get unread message count
    this.transferDataService.unreadMessageCount$.subscribe((count: number) => {
      this.unreadMessageCount = count;
    });

    // Load notifications from API - this will set unreadCount
    this.loadNotifications();

    // Setup WebSocket listener for realtime notifications
    this.setupWebSocketListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load notifications from API
   */
  loadNotifications(): void {
    this.notificationApiService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.notifications = response.data;
            // Calculate unread count from notifications
            this.unreadCount = response.data.filter((n: Notification) => !n.isRead).length;
            console.log('✓ Notifications loaded:', response.data.length, 'Unread:', this.unreadCount);
          }
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
        }
      });
  }

  /**
   * Setup WebSocket listener for realtime notifications
   */
  setupWebSocketListener(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      return;
    }

    // Subscribe to global topic for notifications
    const topic = `global/${currentUser.id}`;
    this.websocketService.subscribeToTopic(topic)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (message: IMessage) => {
          try {
            const data = JSON.parse(message.body);
            this.handleSocketMessage(data);
          } catch (error) {
            console.error('Error parsing socket message:', error);
          }
        },
        error: (error) => {
          console.error('Socket subscription error:', error);
        }
      });
  }

  /**
   * Handle socket message and push notification to list
   */
  handleSocketMessage(data: any): void {
    // Check if notification exists in socket data
    if (data.notify) {
      const notification: Notification = data.notify;

      // Push notification to the beginning of list
      this.notifications.unshift(notification);

      // Update unread count
      if (!notification.isRead) {
        this.unreadCount++;
      }

      console.log('New notification received:', notification);
    }
  }

  showListMessage() {
    this.isShowListMessage = !this.isShowListMessage
    if (this.isShowListMessage) {
      this.isShowNotification = false; // Close notification if message is opened
    }
  }

  showNotification() {
    this.isShowNotification = !this.isShowNotification
    if (this.isShowNotification) {
      this.isShowListMessage = false; // Close message if notification is opened
    }
  }

  goToFriendSearch() {
    this.router.navigate(['/friend-search'])
  }

  protected readonly ICON_MESSAGE = ICON_MESSAGE;
  protected readonly ICON_BELL = ICON_BELL;
}
