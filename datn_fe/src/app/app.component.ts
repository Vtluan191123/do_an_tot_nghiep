import {Component, OnDestroy, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {WebsocketService} from './service/websocket.service';
import {VideoCallComponent} from './page/video-call/video-call.component';
import {DashBoardComponent} from './page/dash-board/dash-board.component';
import {VideoTestComponent} from './page/cideo-test/video-test.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, VideoCallComponent, DashBoardComponent, VideoTestComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit ,OnDestroy{
  title = 'dotn-fe';

  constructor(private websocketService:WebsocketService) {
  }


  ngOnInit() {
    this.websocketService.connect()
  }


  ngOnDestroy(): void {
    this.websocketService.disconnect()
  }
}
