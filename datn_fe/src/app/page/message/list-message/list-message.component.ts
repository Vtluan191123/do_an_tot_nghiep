import {Component, OnInit, Output} from '@angular/core';
import {ICON_SEARCH} from '../../share/other/icons/icons';
import {SafeHtmlPipe} from '../../share/pipe/pipe-html.pipe';
import {MessageDetailComponent} from '../message-detail/message-detail.component';
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import EventEmitter from 'node:events';
import {TransferDataService} from '../../../service/tranfer-data/transfer-data.service';
import {UserService} from '../../../service/user/user.service';
import {BASE_URL_UPLOAD} from '../../../constants/constants';

@Component({
  selector: 'app-list-message',
  standalone: true,
  imports: [
    SafeHtmlPipe,
    MessageDetailComponent,
    NgIf,
    NgForOf,
    NgStyle
  ],
  templateUrl: './list-message.component.html',
  styleUrl: './list-message.component.scss'
})
export class ListMessageComponent implements OnInit{
  isShowMessageDetail:boolean = false
  infoCurrentUser:any
  listGroud:any

  constructor(private transferDataService:TransferDataService,
              private userService:UserService) {
  }

  ngOnInit(): void {
        this.getInfoUser();
        this.getListGrouds()
    }

  getInfoUser(){
    this.transferDataService.infoUser$.subscribe((res:any)=>{
      this.infoCurrentUser = res
    })
  }

  getListGrouds(){
    this.userService.getListGroup(this.infoCurrentUser.id).subscribe((res:any)=>{
      if(res.status === 200) {this.listGroud = res.data.userDetailGroudDto
        console.log(this.listGroud)
      }
    })
  }

  getLatestMessageDisplay(groud: any): string {
    if (!groud) return 'Không có tin nhắn';

    const type = groud.latestMessageType;
    const content = groud.latestMessageContent;

    if (!type) return 'Không có tin nhắn';

    const typeUpper = type.toUpperCase();

    switch (typeUpper) {
      case 'EMOTE':
      case 'ICON':
        return '📎 đã gửi 1 icon';
      case 'IMAGE':
        return '🖼️ đã gửi 1 ảnh';
      case 'VIDEO':
        return '🎥 đã gửi 1 video';
      case 'AUDIO':
        return '🎵 đã gửi audio';
      case 'TEXT':
        // Hiển thị 50 ký tự đầu của text
        return content ? (content.length > 50 ? content.substring(0, 50) + '...' : content) : 'Tin nhắn';
      default:
        return content || 'Tin nhắn';
    }
  }

  handleShowMessageDetail(groud:any) {
    this.isShowMessageDetail = true
    this.transferDataService.sendMessage(groud)
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
  getAvatar(emailOrUsername: string): string {
    if (emailOrUsername) {
      const email = emailOrUsername.toLowerCase().trim();
      const hash = this.simpleHash(email);
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(emailOrUsername)}&background=${hash.substring(0, 6)}&color=fff`;
    }
    return 'https://ui-avatars.com/api/?name=User&background=667eea&color=fff';
  }

  protected readonly ICON_SEARCH = ICON_SEARCH;
  protected readonly BASE_URL_UPLOAD = BASE_URL_UPLOAD;
}
