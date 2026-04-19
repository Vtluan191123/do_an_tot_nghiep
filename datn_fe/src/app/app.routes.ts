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
import { StudentEnrolledSubjectsComponent } from './page/student-enrolled-subjects/student-enrolled-subjects.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Protected routes - require authentication
  { path: '', component: DashBoardComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: DashBoardComponent, canActivate: [authGuard] },
  { path: 'call', component: VideoCallComponent, canActivate: [authGuard] },
  { path: 'room-subject', component: VideoConferenceClientComponent, canActivate: [authGuard] },
  { path: 'category', component: CategoryComponent, canActivate: [authGuard] },
  { path: 'gym-room', component: GymRoomComponent, canActivate: [authGuard] },
  { path: 'friend-search', component: FriendSearchComponent, canActivate: [authGuard] },
  { path: 'class-timetable', component: ClassTimetableComponent, canActivate: [authGuard] },
  { path: 'class-detail', component: ClassDetailComponent, canActivate: [authGuard] },
  { path: 'combo-detail/:id', component: ComboDetailComponent, canActivate: [authGuard] },
  { path: 'subject-detail/:id', component: SubjectDetailComponent, canActivate: [authGuard] },
  { path: 'payment', component: PaymentComponent, canActivate: [authGuard] },
  { path: 'combo-management', component: ComboManagementComponent, canActivate: [authGuard] },
  { path: 'subject-management', component: SubjectManagementComponent, canActivate: [authGuard] },
  { path: 'booking-management', component: BookingManagementComponent, canActivate: [authGuard] },
  { path: 'user-management', component: UserManagementComponent, canActivate: [authGuard] },
  { path: 'statistics', component: StatisticsComponent, canActivate: [authGuard] },
  { path: 'student-enrolled-subjects', component: StudentEnrolledSubjectsComponent, canActivate: [authGuard] },
  { path: 'team', component: OutTeamComponent, canActivate: [authGuard] },

  // Catch-all route
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
