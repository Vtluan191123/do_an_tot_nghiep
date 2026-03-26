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
import {UserDetailComponent} from './page/message/user-detail/user-detail.component';
import {VideoConferenceClientComponent} from './page/video-conference-client/video-conference-client.component';
import {BASE_TOPIC_SOCKET, BASE_TOPIC_SOCKET_FE} from './constants/constants';
import {SocketData} from './model/socket';
import {Subject, Subscription, takeUntil} from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, VideoCallComponent, DashBoardComponent, VideoTestComponent, WidgetComponent, MessageDetailComponent, NgIf, UserDetailComponent, VideoConferenceClientComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit ,OnDestroy{
  title = 'dotn-fe';

  isShowMessageDetail:any
  infoCurrentUser:any
  destroy$ = new Subject<void>();

  constructor(private websocketService:WebsocketService,
              private transferDataService:TransferDataService,
              private authServiceService:AuthServiceService,
              @Inject(PLATFORM_ID) private platformId: Object,
              private toastService:ToastrService,
              private modalService:NgbModal,
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
      console.log('getInfoUser',res)
      this.infoCurrentUser = res
      this.handleConnectTopic()
      this.transferDataService.sendInfoUser(res)
    })

    this.transferDataService.receiverMess$.subscribe((res:any)=>{
      if(res)
      this.toastService.success(`${res} gửi cho bạn tin nhắn`,'Thông báo')
    })


  }

  handleConnectTopic(){
    this.websocketService
      .subscribeToTopic(`${BASE_TOPIC_SOCKET_FE}global/${this.infoCurrentUser.id}`)
      .subscribe((res: any) => {
        const data = JSON.parse(res.body)
        switch (data.type) {
          case 'call': {
            console.log('call', data.metadata);
            this.handleShowModal(data.metadata)
            break;
          }

          case 'message': {
            console.log('message', data.metadata);
            break;
          }

          default: {
            console.warn('Unknown type:', res);
            break;
          }
        }
      });
  }

  handleShowModal(metadata:any){
    const modalRef = this.modalService.open(VideoCallComponent, {
      size: 'xl',
      fullscreen: 'xxl',
      backdrop: "static",
      centered: true,
      windowClass: 'video-call-modal'
    });
    modalRef.componentInstance.receiverCall = true;
    modalRef.componentInstance.metadataCall = metadata
  }



  ngOnDestroy(): void {
    this.websocketService.disconnect()
    this.destroy$.next();
    this.destroy$.complete();
  }
}
