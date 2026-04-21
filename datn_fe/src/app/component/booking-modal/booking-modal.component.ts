import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../service/booking/booking.service';

@Component({
  selector: 'app-booking-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-modal.component.html',
  styleUrls: ['./booking-modal.component.scss']
})
export class BookingModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() timeSlotSubjectData: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  formData = {
    userId: 0,
    subjectId: 0,
    timeSlotSubjectId: 0,
    timeSlotId: 0,
    status: 0
  };

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.initializeUserId();
  }

  initializeUserId(): void {
    // Try to get userId from currentUser (JSON object) - the way AuthService stores it
    try {
      const currentUserStr = localStorage.getItem('currentUser');
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        this.formData.userId = currentUser?.id || currentUser?.userId || 0;
      }
    } catch (error) {
      console.error('Error parsing currentUser from localStorage:', error);
    }
  }

  closeModal(): void {
    this.resetForm();
    this.close.emit();
  }

  resetForm(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  submitBooking(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Get current user ID from localStorage - AuthService stores user as 'currentUser' JSON object
    let userId: number | null = null;

    try {
      const currentUserStr = localStorage.getItem('currentUser');
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        userId = currentUser?.id || currentUser?.userId;
      }
    } catch (error) {
      console.error('Error parsing currentUser from localStorage:', error);
    }

    // If not found in currentUser, try direct userId (fallback)
    if (!userId) {
      const userIdStr = localStorage.getItem('userId');
      if (userIdStr) {
        const parsed = parseInt(userIdStr, 10);
        if (!isNaN(parsed) && parsed > 0) {
          userId = parsed;
        }
      }
    }

    // Validate userId
    if (!userId || userId <= 0) {
      this.errorMessage = 'Vui lòng đăng nhập để đặt lịch';
      console.warn('User ID not found. currentUser:', localStorage.getItem('currentUser'));
      return;
    }

    // Use the timeSlotSubjectData to extract needed info
    const bookingPayload = {
      userId: userId,
      subjectId: this.timeSlotSubjectData?.subjectId,
      timeSlotSubjectId: this.timeSlotSubjectData?.timeSlotsSubjectId,
      status: 0 // 0 = Pending, chưa xác nhận
    };

    if (!bookingPayload.subjectId) {
      this.errorMessage = 'Dữ liệu lớp học không hợp lệ';
      return;
    }

    this.isLoading = true;

    this.bookingService.createBooking(bookingPayload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Đặt lịch thành công! Bạn sẽ được xác nhận trong thời gian sớm nhất.';
        setTimeout(() => {
          this.success.emit();
          this.closeModal();
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error booking:', error);
        this.errorMessage = 'Lỗi đặt lịch: ' + (error?.error?.message || 'Vui lòng thử lại sau');
      }
    });
  }
}

