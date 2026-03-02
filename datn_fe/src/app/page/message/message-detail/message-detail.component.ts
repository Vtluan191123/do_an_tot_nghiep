import { Component } from '@angular/core';
import {SafeHtmlPipe} from '../../share/pipe/pipe-html.pipe';
import {AVATAR_DEFAULT, ICON_CLOSE, ICON_MINUS, ICON_PHONE} from '../../share/other/icons/icons';

@Component({
  selector: 'app-message-detail',
  standalone: true,
  imports: [
    SafeHtmlPipe
  ],
  templateUrl: './message-detail.component.html',
  styleUrl: './message-detail.component.scss'
})
export class MessageDetailComponent {

  protected readonly AVATAR_DEFAULT = AVATAR_DEFAULT;
  protected readonly ICON_CLOSE = ICON_CLOSE;
  protected readonly ICON_PHONE = ICON_PHONE;
  protected readonly ICON_MINUS = ICON_MINUS;
}
