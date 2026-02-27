import {Component, ElementRef, ViewChild} from '@angular/core';
import { Room, RoomEvent, Track } from 'livekit-client';
import {
  AVATAR_DEFAULT,
  CAMERA_OPEN, CLOSE_MESSAGE,
  LEAVE,
  MESSAGE_CHAT,
  MICRO, MICRO_CLOSE,
  SETTING,
  SHARE_SCREEN, VIEW_CHANGE, VIEW_QUALITY
} from '../share/other/icons/icons';
import {SafeHtmlPipe} from '../share/pipe/pipe-html.pipe';
import {NgClass} from '@angular/common';
@Component({
  selector: 'app-video-conference-client',
  standalone: true,
  imports: [
    SafeHtmlPipe,
    NgClass
  ],
  templateUrl: './video-conference-client.component.html',
  styleUrl: './video-conference-client.component.scss'
})
export class VideoConferenceClientComponent {

  statusMicro:boolean = true
  statusChat:boolean = true



  handleStatusMicro() {
    this.statusMicro = !this.statusMicro
  }
  handleStatusChat() {
    this.statusChat = !this.statusChat
  }

  protected readonly AVATAR_DEFAULT = AVATAR_DEFAULT;
  protected readonly MICRO = MICRO;
  protected readonly MICRO_CLOSE = MICRO_CLOSE;
  protected readonly CAMERA_OPEN = CAMERA_OPEN;
  protected readonly SHARE_SCREEN = SHARE_SCREEN;
  protected readonly MESSAGE_CHAT = MESSAGE_CHAT;
  protected readonly SETTING = SETTING;
  protected readonly LEAVE = LEAVE;
  protected readonly VIEW_QUALITY = VIEW_QUALITY;
  protected readonly VIEW_CHANGE = VIEW_CHANGE;


  protected readonly CLOSE_MESSAGE = CLOSE_MESSAGE;
}
