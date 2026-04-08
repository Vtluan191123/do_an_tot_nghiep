import { Component, OnInit } from '@angular/core';
import {ListMessageComponent} from "../../message/list-message/list-message.component";
import {SafeHtmlPipe} from "../pipe/pipe-html.pipe";
import {ICON_MESSAGE, ICON_BELL} from '../other/icons/icons';
import {RouterLink, Router} from '@angular/router';
import {UserProfileDropdownComponent} from "../../dash-board/user-profile-dropdown/user-profile-dropdown.component";
import {NotificationListComponent} from "../notification-list/notification-list.component";
import {NotificationService} from "../../../service/notification/notification.service";
import {CommonModule} from '@angular/common';

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
export class NavComponent implements OnInit {

  isShowListMessage: boolean = false
  isShowNotification: boolean = false
  unreadCount: number = 0

  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.notificationService.getUnreadCount().subscribe((count) => {
      this.unreadCount = count;
    });
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
