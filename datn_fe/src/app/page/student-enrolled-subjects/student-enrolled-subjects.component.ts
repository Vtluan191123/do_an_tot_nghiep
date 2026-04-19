import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserEnrolledSubjectService } from '../../service/user/user-enrolled-subject.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EnrolledSubject } from '../../model/enrolled-subject.model';
import { AuthService } from '../../service/auth/auth.service';

@Component({
  selector: 'app-student-enrolled-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './student-enrolled-subjects.component.html',
  styleUrl: './student-enrolled-subjects.component.scss'
})
export class StudentEnrolledSubjectsComponent implements OnInit, OnDestroy {
  enrolledSubjects: EnrolledSubject[] = [];
  isLoading = false;
  currentUserId: number | null = null;
  totalSessions = 0;
  totalRemaining = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private userEnrolledSubjectService: UserEnrolledSubjectService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    // Get current user ID from auth service
    this.currentUserId = this.authService.getCurrentUserId();
  }

  ngOnInit(): void {
    if (this.currentUserId) {
      this.loadEnrolledSubjects();
    } else {
      this.toastr.error('Không thể lấy thông tin người dùng');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load enrolled subjects for current user
   */
  loadEnrolledSubjects(): void {
    if (!this.currentUserId) {
      return;
    }

    this.isLoading = true;

    this.userEnrolledSubjectService.getEnrolledSubjects(this.currentUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.enrolledSubjects = response.data;
            this.calculateTotals();
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error loading enrolled subjects:', error);
          this.toastr.error('Lỗi khi tải danh sách môn học đã đăng ký');
        }
      });
  }

  /**
   * Calculate total sessions and remaining sessions
   */
  calculateTotals(): void {
    this.totalSessions = 0;
    this.totalRemaining = 0;

    this.enrolledSubjects.forEach(subject => {
      this.totalSessions += subject.total;
      this.totalRemaining += subject.remaining;
    });
  }

  /**
   * Get progress percentage for a subject
   */
  getProgressPercentage(subject: EnrolledSubject): number {
    if (subject.total === 0) {
      return 0;
    }
    return Math.round(((subject.total - subject.remaining) / subject.total) * 100);
  }

  /**
   * Format date for display
   */
  formatDate(date: string): string {
    if (!date) {
      return '';
    }
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  /**
   * Get status label based on remaining sessions
   */
  getStatusLabel(subject: EnrolledSubject): string {
    if (subject.remaining === 0) {
      return 'Hoàn thành';
    } else if (subject.remaining <= 2) {
      return 'Sắp hết';
    } else {
      return 'Đang học';
    }
  }

  /**
   * Get status badge class
   */
  getStatusBadgeClass(subject: EnrolledSubject): string {
    if (subject.remaining === 0) {
      return 'badge-success';
    } else if (subject.remaining <= 2) {
      return 'badge-warning';
    } else {
      return 'badge-info';
    }
  }
}

