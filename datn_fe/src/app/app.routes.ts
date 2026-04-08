import { Routes } from '@angular/router';
import {DashBoardComponent} from './page/dash-board/dash-board.component';
import {VideoConferenceClientComponent} from './page/video-conference-client/video-conference-client.component';
import {VideoCallComponent} from './page/video-call/video-call.component';
import {CategoryComponent} from './page/category/category.component';
import { LoginComponent } from './page/login/login.component';
import { RegisterComponent } from './page/register/register.component';
import { OutTeamComponent } from './page/out-team/out-team.component';
import { ClassDetailComponent } from './page/class-detail/class-detail.component';
import { ClassTimetableComponent } from './page/class-timetable/class-timetable.component';
import { GymRoomComponent } from './page/gym-room/gym-room.component';
import { FriendSearchComponent } from './page/friend-search/friend-search.component';

export const routes: Routes = [
  { path: '', component: DashBoardComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'call', component: VideoCallComponent },
  { path: 'room-subject', component: VideoConferenceClientComponent },
  { path: 'category', component: CategoryComponent },
  { path: 'gym-room', component: GymRoomComponent },
  { path: 'friend-search', component: FriendSearchComponent },
  { path: 'class-timetable', component: ClassTimetableComponent },
  { path: 'class-detail', component: ClassDetailComponent },
  { path: 'team', component: OutTeamComponent },
  // Catch-all route: nếu sai path sẽ forward về ''
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
