import { Component, OnInit, OnDestroy } from '@angular/core';
import {ListMessageComponent} from "../../message/list-message/list-message.component";
import {SafeHtmlPipe} from "../pipe/pipe-html.pipe";
import {ICON_MESSAGE, ICON_BELL} from '../other/icons/icons';
import {RouterLink, Router, NavigationEnd} from '@angular/router';
import {UserProfileDropdownComponent} from "../../dash-board/user-profile-dropdown/user-profile-dropdown.component";
import {NotificationListComponent} from "../notification-list/notification-list.component";
import {NotificationService} from "../../../service/notification/notification.service";
import {CommonModule} from '@angular/common';
import {TransferDataService} from "../../../service/tranfer-data/transfer-data.service";
import {WebsocketService} from "../../../service/socket/websocket.service";
import {AuthService} from "../../../service/auth/auth.service";
import {NotificationApiService} from "../../../service/notification/notification-api.service";
import {Subject} from "rxjs";
import {takeUntil, filter} from "rxjs/operators";
import {IMessage} from "@stomp/stompjs";
import {RoleUtil} from "../../../util/role.util";

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

export interface MenuItem {
  label: string;
  route: string;
  roles?: string[]; // If empty/undefined, visible to all roles
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
  currentRoute: string = '';
  userRole: string = ''; // Will be set based on current user

  private destroy$ = new Subject<void>();

  // All available menu items with role restrictions
  private allMenuItems: MenuItem[] = [
    { label: 'Trang Chủ', route: '/', roles: ['ROLE_USER'] },
    { label: 'Đặt Lịch', route: '/class-timetable', roles: ['ROLE_USER'] },
    { label: 'Phòng Tập Trực Tuyến', route: '/training-room-by-subject', roles: ['ROLE_USER'] },
    { label: 'Quản lý Phòng Tập Trực Tuyến', route: '/gym-room', roles: [ 'ROLE_COACH'] },
    { label: 'Đội Ngũ', route: '/team', roles: ['ROLE_USER'] },
    { label: 'Môn Học Của Tôi', route: '/student-enrolled-subjects', roles: ['ROLE_USER'] },
    { label: 'Quản Lý Combo', route: '/combo-management', roles: ['ROLE_ADMIN'] },
    { label: 'Quản Lý Môn Học', route: '/subject-management', roles: ['ROLE_ADMIN'] },
    { label: 'Quản Lý Đặt Lịch', route: '/booking-management', roles: ['ROLE_COACH'] },
    { label: 'Quản Lý Khung Giờ Dạy', route: '/coach-time-slots-management', roles: ['ROLE_COACH'] },
    { label: 'Quản Lý Người dùng', route: '/user-management', roles: ['ROLE_ADMIN'] },
    { label: 'Thống Kê & Báo Cáo', route: '/statistics', roles: ['ROLE_ADMIN'] },
    { label: 'Quản Lý AI Training', route: '/ai-training-management', roles: ['ROLE_ADMIN'] }
  ];

  // Filtered menu items based on user role
  get menuItems(): MenuItem[] {
    if (!this.userRole) {
      return [];
    }
    return this.allMenuItems.filter(item => {
      // If no roles specified, show to all
      if (!item.roles || item.roles.length === 0) {
        return true;
      }
      // Show if user's role is in the item's roles array
      return item.roles.includes(this.userRole);
    });
  }

  // Get default route based on user role
  private getDefaultRoute(): string {
    return RoleUtil.getDefaultRoute(this.userRole);
  }

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private transferDataService: TransferDataService,
    private websocketService: WebsocketService,
    private authService: AuthService,
    private notificationApiService: NotificationApiService
  ) {}

  /**
   * Convert roleId to role string
   */
  private getRoleFromRoleId(roleId: any): string {
    return RoleUtil.getRoleFromRoleId(roleId);
  }

  ngOnInit(): void {
    // Initialize user role from current user
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.roleId) {
      this.userRole = this.getRoleFromRoleId(currentUser.roleId);
    }

    // Subscribe to user changes to update role dynamically
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: any) => {
        if (user && user.roleId) {
          this.userRole = this.getRoleFromRoleId(user.roleId);
        }
      });

    // Track current route
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: any) => {
        this.currentRoute = event.urlAfterRedirects || event.url;
      });

    // Set initial route
    this.currentRoute = this.router.url;

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
   * Check if menu item is active
   */
  isMenuItemActive(route: string): boolean {
    // Exact match for root path
    if (route === '/' && this.currentRoute === '/') {
      return true;
    }
    // Don't match root for other routes
    if (route === '/') {
      return false;
    }
    // Check if current route starts with the menu item route
    return this.currentRoute.startsWith(route);
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
