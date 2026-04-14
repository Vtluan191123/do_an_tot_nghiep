import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../service/booking/booking.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Booking {
  id?: number;
  userId: number;
  subjectId: number;
  timeSlotId: number;
  status: number;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-booking-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-management.component.html',
  styleUrl: './booking-management.component.scss'
})
export class BookingManagementComponent implements OnInit, OnDestroy {
  bookings: Booking[] = [];
  isLoading = false;
  showForm = false;
  isEditing = false;
  selectedBooking: Booking | null = null;

  statusOptions = [
    { value: 0, label: 'Chưa Xác Nhận' },
    { value: 1, label: 'Đã Xác Nhận' },
    { value: 2, label: 'Đã Hoàn Thành' },
    { value: 3, label: 'Đã Hủy' }
  ];

  formData: Booking = {
    userId: 0,
    subjectId: 0,
    timeSlotId: 0,
    status: 0
  };

  private destroy$ = new Subject<void>();

  constructor(
    private bookingService: BookingService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBookings(): void {
    this.isLoading = true;
    const filter = {
      page: 0,
      size: 100,
      sortBy: 'id',
      sortDirection: 'DESC'
    };

    this.bookingService.getAllBookings(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.bookings = response.data;
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading bookings:', error);
          this.toastr.error('Lỗi tải danh sách đặt lịch');
          this.isLoading = false;
        }
      });
  }

  openForm(booking?: Booking): void {
    this.showForm = true;
    if (booking) {
      this.isEditing = true;
      this.selectedBooking = booking;
      this.formData = { ...booking };
    } else {
      this.isEditing = false;
      this.selectedBooking = null;
      this.formData = {
        userId: 0,
        subjectId: 0,
        timeSlotId: 0,
        status: 0
      };
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.selectedBooking = null;
    this.formData = {
      userId: 0,
      subjectId: 0,
      timeSlotId: 0,
      status: 0
    };
  }

  saveBooking(): void {
    if (!this.formData.userId || !this.formData.subjectId || !this.formData.timeSlotId) {
      this.toastr.warning('Vui lòng điền đủ các trường bắt buộc');
      return;
    }

    if (this.isEditing && this.selectedBooking?.id) {
      const updateRequest = {
        id: this.selectedBooking.id,
        ...this.formData
      };
      this.bookingService.updateBooking(updateRequest)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success('Cập nhật đặt lịch thành công');
            this.closeForm();
            this.loadBookings();
          },
          error: (error) => {
            console.error('Error updating booking:', error);
            this.toastr.error('Lỗi cập nhật đặt lịch');
          }
        });
    } else {
      this.bookingService.createBooking(this.formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success('Thêm đặt lịch thành công');
            this.closeForm();
            this.loadBookings();
          },
          error: (error) => {
            console.error('Error creating booking:', error);
            this.toastr.error('Lỗi thêm đặt lịch');
          }
        });
    }
  }

  deleteBooking(id: number): void {
    if (confirm('Bạn có chắc muốn xóa đặt lịch này?')) {
      this.bookingService.deleteBooking(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success('Xóa đặt lịch thành công');
            this.loadBookings();
          },
          error: (error) => {
            console.error('Error deleting booking:', error);
            this.toastr.error('Lỗi xóa đặt lịch');
          }
        });
    }
  }

  getStatusLabel(status: number): string {
    const option = this.statusOptions.find(o => o.value === status);
    return option ? option.label : 'Không xác định';
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 0:
        return 'badge-warning';
      case 1:
        return 'badge-info';
      case 2:
        return 'badge-success';
      case 3:
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }
}

