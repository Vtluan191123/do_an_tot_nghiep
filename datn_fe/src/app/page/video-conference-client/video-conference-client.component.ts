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
import {NgClass, NgForOf, NgIf, NgStyle} from '@angular/common';
import {NgSelectComponent} from '@ng-select/ng-select';
import {FormsModule} from '@angular/forms';
@Component({
  selector: 'app-video-conference-client',
  standalone: true,
  imports: [
    SafeHtmlPipe,
    NgClass,
    NgForOf,
    NgIf,
    NgStyle,
    NgSelectComponent,
    FormsModule
  ],
  templateUrl: './video-conference-client.component.html',
  styleUrl: './video-conference-client.component.scss'
})
export class VideoConferenceClientComponent {

  //status
  statusMicro:boolean = true
  statusCamera:boolean = true
  statusChat:boolean = false
  isShowListUser:boolean = false
  isShowMicDevices:boolean = false
  isShowCameraDevices:boolean = false
  isShowBackground:boolean = false

  listViewUserMain:any[] = [1,2,4,5,9,8]
  listViewUser:any[] = []
  userViewDetail:any[] = []
  listMicroDevices: readonly any[] = [
    {
      "name":"mic1",
      "value":1
    },
    {
      "name":"mic2",
      "value":2
    }
    ,
    {
      "name":"mic2",
      "value":3
    }
    ,
    {
      "name":"mic2",
      "value":4
    }
  ]
  listCameraDevices: readonly any[] = [
    {
      "name": "camera1",
      "value": 1
    },
    {
      "name": "camera2",
      "value": 2
    }
  ]

  listBackground: readonly any[] = [
    {
      "name": "back1",
      "value": 1
    },
    {
      "name": "back2",
      "value": 2
    }
  ]

  selectedMicro: any = 1;
  selectedCamera: any = 1;
  selectedBackground: any = 1;



  handleStatusMicro() {
    this.statusMicro = !this.statusMicro
  }

  handleStatusCamera() {
    this.statusCamera = !this.statusCamera
  }
  handleStatusChat() {
    this.statusChat = !this.statusChat
  }

  closeMessage() {
    this.statusChat = false
  }

  handleChangeViewDetail(viewId:number){
    this.userViewDetail = []
    this.isShowListUser = !this.isShowListUser
    if(this.isShowListUser){
      this.userViewDetail.push(viewId)
      this.listViewUser = this.listViewUserMain.filter(x => x !== viewId)
    }
  }

  handleSwitchViewDetail(viewId:number){
    this.userViewDetail = []
    if(this.isShowListUser){
      this.userViewDetail.push(viewId)
      this.listViewUser = this.listViewUserMain.filter(x => x !== viewId)
    }
  }

  handleChangeMic(value:any) {
    this.selectedMicro = value
    this.isShowMicDevices = false
  }

  showChangeMic() {
    this.isShowCameraDevices = false
    this.isShowMicDevices = !this.isShowMicDevices
  }

  handleChangeCamera(value:any) {
    this.selectedCamera = value
    this.isShowCameraDevices = false
  }

  showChangeCamera() {
    this.isShowMicDevices = false
    this.isShowCameraDevices = !this.isShowCameraDevices
  }

  handleChangeBackground(value:any) {
    this.selectedBackground = value
    this.isShowBackground = false
  }

  showChangeBackground() {
    this.isShowBackground = !this.isShowBackground
  }


  getCols() {
    const count = this.isShowListUser ? this.userViewDetail.length : this.listViewUserMain.length
    if (count > 4) return 3;
    if (count > 1) return 2;
    return 1;
  }

  getRows() {
    const count = this.isShowListUser ? this.userViewDetail.length : this.listViewUserMain.length
    if (count > 6) return 3;
    if (count > 3) return 2;
    return 1;
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
