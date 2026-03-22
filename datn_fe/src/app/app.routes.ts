import { Routes } from '@angular/router';
import {DashBoardComponent} from './page/dash-board/dash-board.component';
import {VideoConferenceClientComponent} from './page/video-conference-client/video-conference-client.component';
import {VideoCallComponent} from './page/video-call/video-call.component';

export const routes: Routes = [
  { path: '', component: DashBoardComponent },
  {path: 'call',component:VideoCallComponent},
  { path: 'room-subject', component: VideoConferenceClientComponent }
];
