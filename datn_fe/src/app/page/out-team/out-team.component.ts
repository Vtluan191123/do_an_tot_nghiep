import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {BASE_URL_UPLOAD} from '../../constants/constants';

@Component({
  selector: 'app-out-team',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './out-team.component.html',
  styleUrls: ['./out-team.component.scss']
})
export class OutTeamComponent implements OnInit, OnDestroy {
  coaches: any[] = [];
  selectedCoach: any = null;
  showModal = false;
  loading = false;
  addingFriend = false;
  currentUserId: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCoaches();
    this.getCurrentUser();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getCurrentUser(): void {
    // Lấy current user từ auth service hoặc localStorage
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserId = user.id;
      } catch (e) {
        console.error('Error parsing current user:', e);
      }
    }
  }

  loadCoaches(): void {
    this.loading = true;
    this.http.get<any>('/api/user/coaches/all')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.coaches = response.data || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading coaches:', err);
          this.loading = false;
        }
      });
  }

  selectCoach(coach: any): void {
    this.selectedCoach = coach;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedCoach = null;
  }

  addFriend(): void {
    if (!this.currentUserId) {
      alert('Vui lòng đăng nhập để gửi lời mời kết bạn');
      return;
    }

    if (!this.selectedCoach?.id) {
      alert('Không thể xác định coach');
      return;
    }

    this.addingFriend = true;
    const params = {
      userAddId: this.currentUserId,
      userReceiverId: this.selectedCoach.id
    };

    this.http.post<any>('/api/friend/add', null, { params })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.addingFriend = false;
          alert('Đã gửi lời mời kết bạn thành công!');
          this.closeModal();
        },
        error: (err) => {
          this.addingFriend = false;
          console.error('Error adding friend:', err);
          if (err.status === 400) {
            alert('Lời mời kết bạn đã tồn tại hoặc bạn đã là bạn bè của người này');
          } else {
            alert('Có lỗi xảy ra khi gửi lời mời kết bạn');
          }
        }
      });
  }

  protected readonly BASE_URL_UPLOAD = BASE_URL_UPLOAD;
}




