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
  @Input() timeSlotsSubjectData: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  formData = {
    userId: 0,
    subjectId: 0,
    timeSlotsSubjectId: 0,
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
    // Try to get userId from localStorage (if user is logged in)
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      this.formData.userId = parseInt(storedUserId, 10);
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

    if (!this.formData.userId) {
      this.errorMessage = 'Vui lòng nhập ID người dùng';
      return;
    }

    if (this.formData.userId <= 0) {
      this.errorMessage = 'ID người dùng không hợp lệ';
      return;
    }

    // Use the timeSlotsSubjectData to extract needed info
    const bookingPayload = {
      userId: this.formData.userId,
      subjectId: this.timeSlotsSubjectData?.subjectId,
      timeSlotId: this.timeSlotsSubjectData?.timeSlotsId || 0,
      status: 0 // Chưa xác nhận
    };

    if (!bookingPayload.subjectId) {
      this.errorMessage = 'Dữ liệu lớp học không hợp lệ';
      return;
    }

    this.isLoading = true;

    this.bookingService.createBooking(bookingPayload).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Đặt lịch thành công!';
        setTimeout(() => {
          this.success.emit();
          this.closeModal();
        }, 1000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error booking:', error);
        this.errorMessage = 'Lỗi đặt lịch: ' + (error?.error?.message || 'Vui lòng thử lại');
      }
    });
  }
}

