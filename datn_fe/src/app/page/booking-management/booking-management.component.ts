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
  filteredBookings: Booking[] = [];
  isLoading = false;
  showForm = false;
  isEditing = false;
  selectedBooking: Booking | null = null;

  // View mode
  viewMode: 'timetable' | 'list' = 'timetable';

  // Timetable data
  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  timeSlots = ['6.00am - 8.00am', '10.00am - 12.00am', '5.00pm - 7.00pm', '7.00pm - 9.00pm'];

  // Filter properties
  selectedStatus: any = '';
  searchUserId: string = '';

  statusOptions = [
    { value: 0, label: 'Chưa Xác Nhận' },
    { value: 1, label: 'Đã Xác Nhận' },
    { value: 2, label: 'Đã Hoàn Thành' },
    { value: 3, label: 'Đã Hủy' }
  ];

  // Mock timetable data
  private timetableData: any[] = [
    { day: 'Monday', timeSlot: '6.00am - 8.00am', className: 'WEIGHT LOOSE', trainer: 'RLefew D. Loee', status: 1 },
    { day: 'Tuesday', timeSlot: '6.00am - 8.00am', className: 'Cardio', trainer: 'RLefew D. Loee', status: 0 },
    { day: 'Wednesday', timeSlot: '6.00am - 8.00am', className: 'Yoga', trainer: 'Keaf Shen', status: 1 },
    { day: 'Thursday', timeSlot: '6.00am - 8.00am', className: 'Fitness', trainer: 'Kimberly Stone', status: 1 },
    { day: 'Saturday', timeSlot: '6.00am - 8.00am', className: 'Boxing', trainer: 'Rachel Adam', status: 2 },
    { day: 'Sunday', timeSlot: '6.00am - 8.00am', className: 'Body Building', trainer: 'Robert Cage', status: 1 }
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
            this.filterBookings(); // Apply filters after loading
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

  filterBookings(): void {
    this.filteredBookings = this.bookings.filter(booking => {
      let statusMatch = true;
      let userIdMatch = true;

      // Check status filter
      if (this.selectedStatus !== '') {
        statusMatch = booking.status === parseInt(this.selectedStatus, 10);
      }

      // Check userId search
      if (this.searchUserId) {
        userIdMatch = booking.userId.toString().includes(this.searchUserId);
      }

      return statusMatch && userIdMatch;
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


  // Timetable helper methods
  getBookingForSlot(day: string, timeSlot: string): any {
    return this.timetableData.find(item => item.day === day && item.timeSlot === timeSlot);
  }

  getBookingClass(day: string, timeSlot: string): string {
    const booking = this.getBookingForSlot(day, timeSlot);
    if (!booking) {
      return 'empty';
    }

    const classes = ['has-booking'];
    if (booking.status === 0) {
      classes.push('unconfirmed');
    } else if (booking.status === 1) {
      classes.push('confirmed');
    } else if (booking.status === 2) {
      classes.push('completed');
    } else if (booking.status === 3) {
      classes.push('cancelled');
    }

    return classes.join(' ');
  }

  selectTimeSlot(day: string, timeSlot: string): void {
    const booking = this.getBookingForSlot(day, timeSlot);
    if (booking) {
      console.log('Selected booking:', booking);
      // Can open a modal to edit or view details
    }
  }

  getStatusBadge(status: number): string {
    const option = this.statusOptions.find(o => o.value === status);
    return option ? option.label : 'N/A';
  }
}
