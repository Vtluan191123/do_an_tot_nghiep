import { Routes } from '@angular/router';
import {DashBoardComponent} from './page/dash-board/dash-board.component';
import {VideoConferenceClientComponent} from './page/video-conference-client/video-conference-client.component';

export const routes: Routes = [
  { path: '', component: DashBoardComponent },
  { path: 'room-subject', component: VideoConferenceClientComponent }
];
