import {Component, Inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import {WebsocketService} from './service/socket/websocket.service';
import {VideoCallComponent} from './page/video-call/video-call.component';
import {DashBoardComponent} from './page/dash-board/dash-board.component';
import {VideoTestComponent} from './page/cideo-test/video-test.component';
import {WidgetComponent} from './page/widget/widget.component';
import {MessageDetailComponent} from './page/message/message-detail/message-detail.component';
import {TransferDataService} from './service/tranfer-data/transfer-data.service';
import {isPlatformBrowser, NgIf} from '@angular/common';
import {AuthServiceService} from './service/auth/auth-service.service';
import { AuthService } from './service/auth/auth.service';
import {ToastrService} from 'ngx-toastr';
import {UserDetailComponent} from './page/message/user-detail/user-detail.component';
import {VideoConferenceClientComponent} from './page/video-conference-client/video-conference-client.component';
import {BASE_TOPIC_SOCKET, BASE_TOPIC_SOCKET_FE} from './constants/constants';
import {SocketData} from './model/socket';
import {Subject, Subscription, takeUntil} from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NavComponent} from './page/share/nav/nav.component';
import {FooterComponent} from './page/share/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, VideoCallComponent, DashBoardComponent, VideoTestComponent, WidgetComponent, MessageDetailComponent, NgIf, UserDetailComponent, VideoConferenceClientComponent, NavComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit ,OnDestroy{
  title = 'dotn-fe';

  isShowMessageDetail:any
  infoCurrentUser:any
  destroy$ = new Subject<void>();
  showNav = true;

  constructor(private websocketService:WebsocketService,
              private transferDataService:TransferDataService,
              private authServiceService:AuthServiceService,
              private authService: AuthService,
              private router: Router,
              @Inject(PLATFORM_ID) private platformId: Object,
              private toastService:ToastrService,
              private modalService:NgbModal,
              ) {
  }


  ngOnInit() {
    // Check route to show/hide nav
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(() => {
      const currentUrl = this.router.url;
      this.showNav = !currentUrl.includes('/login') && !currentUrl.includes('/register');
    });

    this.init()
    this.handleShowMessageDetail();
    this.hidePreloder();
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

    // Get current user from auth service first
    const currentUser = this.authService?.getCurrentUser();

    if (currentUser && currentUser.id) {
      this.infoCurrentUser = currentUser;
      this.handleConnectTopic();
      this.transferDataService.sendInfoUser(currentUser);
    } else {
      // If no current user, fetch from API
      this.authServiceService.getInfoUser().subscribe(
        (res: any) => {
          console.log('getInfoUser', res);
          this.infoCurrentUser = res;
          this.handleConnectTopic();
          this.transferDataService.sendInfoUser(res);
        },
        (error) => {
          console.error('Failed to get user info:', error);
        }
      );
    }

    this.transferDataService.receiverMess$.subscribe((res: any) => {
      if (res)
        this.toastService.success(`${res} gửi cho bạn tin nhắn`, 'Thông báo')
    });
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

  hidePreloder() {
    if (!isPlatformBrowser(this.platformId)) return;
    // Delay 1000ms để đảm bảo DOM fully render, rồi fadeOut preloder
    setTimeout(() => {
      if (typeof (window as any).$ !== 'undefined') {
        const $ = (window as any).$;
        $('.loader').fadeOut(300);
        $('#preloder').delay(300).fadeOut(300, () => {
          $('#preloder').remove();
        });
      } else {
        // Nếu không có jQuery, xóa preloder bằng DOM API
        const preloder = document.getElementById('preloder');
        if (preloder) {
          preloder.style.display = 'none';
        }
      }
    }, 1000);
  }


  ngOnDestroy(): void {
    this.websocketService.disconnect()
    this.destroy$.next();
    this.destroy$.complete();
  }
}
