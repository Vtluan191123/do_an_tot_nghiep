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
import { ComboDetailComponent } from './page/combo-detail/combo-detail.component';
import { SubjectDetailComponent } from './page/subject-detail/subject-detail.component';
import { PaymentComponent } from './page/payment/payment.component';
import { ComboManagementComponent } from './page/combo-management/combo-management.component';
import { SubjectManagementComponent } from './page/subject-management/subject-management.component';
import { BookingManagementComponent } from './page/booking-management/booking-management.component';
import { UserManagementComponent } from './page/user-management/user-management.component';
import { StatisticsComponent } from './page/statistics/statistics.component';

export const routes: Routes = [
  { path: '', component: DashBoardComponent },
  { path: 'dashboard', component: DashBoardComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'call', component: VideoCallComponent },
  { path: 'room-subject', component: VideoConferenceClientComponent },
  { path: 'category', component: CategoryComponent },
  { path: 'gym-room', component: GymRoomComponent },
  { path: 'friend-search', component: FriendSearchComponent },
  { path: 'class-timetable', component: ClassTimetableComponent },
  { path: 'class-detail', component: ClassDetailComponent },
  { path: 'combo-detail/:id', component: ComboDetailComponent },
  { path: 'subject-detail/:id', component: SubjectDetailComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'combo-management', component: ComboManagementComponent },
  { path: 'subject-management', component: SubjectManagementComponent },
  { path: 'booking-management', component: BookingManagementComponent },
  { path: 'user-management', component: UserManagementComponent },
  { path: 'statistics', component: StatisticsComponent },
  { path: 'team', component: OutTeamComponent },
  // Catch-all route: nếu sai path sẽ forward về ''
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
