import {Component, Inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {WebsocketService} from './service/socket/websocket.service';
import {VideoCallComponent} from './page/video-call/video-call.component';
import {DashBoardComponent} from './page/dash-board/dash-board.component';
import {VideoTestComponent} from './page/cideo-test/video-test.component';
import {WidgetComponent} from './page/widget/widget.component';
import {MessageDetailComponent} from './page/message/message-detail/message-detail.component';
import {TransferDataService} from './service/tranfer-data/transfer-data.service';
import {isPlatformBrowser, NgIf} from '@angular/common';
import {AuthServiceService} from './service/auth/auth-service.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, VideoCallComponent, DashBoardComponent, VideoTestComponent, WidgetComponent, MessageDetailComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit ,OnDestroy{
  title = 'dotn-fe';

  isShowMessageDetail:any
  countMessage:any

  constructor(private websocketService:WebsocketService,
              private transferDataService:TransferDataService,
              private authServiceService:AuthServiceService,
              @Inject(PLATFORM_ID) private platformId: Object,
              private toastService:ToastrService
              ) {
  }


  ngOnInit() {
    this.init()
    this.handleShowMessageDetail();
  }


  handleShowMessageDetail(){
    this.transferDataService.userDetailGroud$.subscribe((res:any)=>{
      this.isShowMessageDetail = res
    })
  }

  init(){
    if (isPlatformBrowser(this.platformId)) {
      this.websocketService.connect()
    }

    //get info user
    this.authServiceService.getInfoUser().subscribe((res:any)=>{
      this.transferDataService.sendInfoUser(res)
    })

    this.transferDataService.receiverMess$.subscribe((res:any)=>{
      if(res)
      this.toastService.success(`${res} gửi cho bạn tin nhắn`,'Thông báo')
    })
  }

  ngOnDestroy(): void {
    this.websocketService.disconnect()
  }
}
