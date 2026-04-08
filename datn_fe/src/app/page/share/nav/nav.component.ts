import { Component } from '@angular/core';
import {ListMessageComponent} from "../../message/list-message/list-message.component";
import {SafeHtmlPipe} from "../pipe/pipe-html.pipe";
import {ICON_MESSAGE} from '../other/icons/icons';
import {RouterLink} from '@angular/router';
import {UserProfileDropdownComponent} from "../../dash-board/user-profile-dropdown/user-profile-dropdown.component";

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [
    ListMessageComponent,
    SafeHtmlPipe,
    RouterLink,
    UserProfileDropdownComponent
  ],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent {

  isShowListMessage: boolean = false



  showListMessage() {
    this.isShowListMessage = !this.isShowListMessage
  }

  protected readonly ICON_MESSAGE = ICON_MESSAGE;
}
