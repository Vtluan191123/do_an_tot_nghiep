import {Component, OnDestroy, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {WebsocketService} from './service/websocket.service';
import {VideoCallComponent} from './page/video-call/video-call.component';
import {DashBoardComponent} from './page/dash-board/dash-board.component';
import {VideoTestComponent} from './page/cideo-test/video-test.component';
import {WidgetComponent} from './page/widget/widget.component';
import {MessageDetailComponent} from './page/message/message-detail/message-detail.component';
import {TransferDataService} from './service/tranfer-data/transfer-data.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, VideoCallComponent, DashBoardComponent, VideoTestComponent, WidgetComponent, MessageDetailComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit ,OnDestroy{
  title = 'dotn-fe';

  isshowMessageDetail:any

  constructor(private websocketService:WebsocketService,private transferDataService:TransferDataService) {
  }


  ngOnInit() {
    this.websocketService.connect()
    this.handleShowMessageDetail();
  }


  handleShowMessageDetail(){
    this.transferDataService.showMessageDetail$.subscribe((res:any)=>{
      this.isshowMessageDetail = res
    })
  }

  ngOnDestroy(): void {
    this.websocketService.disconnect()
  }
}
