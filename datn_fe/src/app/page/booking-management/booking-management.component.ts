import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../service/booking/booking.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Booking {
  timeSlotName?: string;
  id?: number;
  userId: number;
  userName?: string;
  subjectId: number;
  timeSlotSubjectId: number;
  status: number;
  createdAt?: string;
  updatedAt?: string;
  subjectName?: string;
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
  showEditForm = false;
  selectedBooking: Booking | null = null;

  // Filter properties
  searchUsername: string = '';
  searchStatus: string = '';
  searchFromDate: string = '';
  searchToDate: string = '';

  // Form data
  formData = {
    id: 0,
    status: 0
  };

  statusOptions = [
    { value: 0, label: 'Chưa Xác Nhận' },
    { value: 1, label: 'Đã Xác Nhận' },
    { value: 2, label: 'Đã Hủy' }
  ];

  // Pagination properties
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

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
      page: this.currentPage,
      size: this.pageSize,
      sortBy: 'id',
      sortDirection: 'DESC'
    };

    // Use the new API endpoint with joined data
    this.bookingService.getAllBookingsWithJoin(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.bookings = response.data;
            this.totalElements = response.count || 0;
            this.totalPages = response.totalPages || 0;
            this.filterBookings();
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

  onSearch(): void {
    this.currentPage = 0;
    this.filterBookings();
  }

  onReset(): void {
    this.searchUsername = '';
    this.searchStatus = '';
    this.searchFromDate = '';
    this.searchToDate = '';
    this.currentPage = 0;
    this.filterBookings();
  }

  filterBookings(): void {
    this.filteredBookings = this.bookings.filter(booking => {
      let usernameMatch = true;
      let statusMatch = true;
      let dateMatch = true;

      // Check username filter
      if (this.searchUsername && this.searchUsername.trim()) {
        const username = (booking.userName || '').toLowerCase();
        usernameMatch = username.includes(this.searchUsername.toLowerCase());
      }

      // Check status filter
      if (this.searchStatus !== '') {
        statusMatch = booking.status === parseInt(this.searchStatus, 10);
      }

      // Check date range filter
      if (this.searchFromDate || this.searchToDate) {
        const bookingDate = booking.createdAt ? new Date(booking.createdAt) : null;

        if (this.searchFromDate) {
          const fromDate = new Date(this.searchFromDate);
          fromDate.setHours(0, 0, 0, 0);
          dateMatch = bookingDate ? bookingDate >= fromDate : false;
        }

        if (this.searchToDate && dateMatch) {
          const toDate = new Date(this.searchToDate);
          toDate.setHours(23, 59, 59, 999);
          dateMatch = bookingDate ? bookingDate <= toDate : false;
        }
      }

      return usernameMatch && statusMatch && dateMatch;
    });
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

  openEditForm(booking: Booking): void {
    this.selectedBooking = booking;
    this.formData = {
      id: booking.id || 0,
      status: booking.status
    };
    this.showEditForm = true;
  }

  closeEditForm(): void {
    this.showEditForm = false;
    this.selectedBooking = null;
    this.formData = {
      id: 0,
      status: 0
    };
  }

  updateBookingStatus(): void {
    if (!this.formData.id) {
      this.toastr.warning('Vui lòng chọn đặt lịch');
      return;
    }

    const updateRequest = {
      id: this.formData.id,
      status: this.formData.status,
      userId: this.selectedBooking?.userId,
      subjectId: this.selectedBooking?.subjectId,
      timeSlotSubjectId: this.selectedBooking?.timeSlotSubjectId
    };

    this.bookingService.updateBooking(updateRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Cập nhật trạng thái đặt lịch thành công');
          this.closeEditForm();
          this.loadBookings();
        },
        error: (error) => {
          console.error('Error updating booking:', error);
          this.toastr.error('Lỗi cập nhật trạng thái đặt lịch');
        }
      });
  }

  getStatusLabel(status: number): string {
    const option = this.statusOptions.find(o => o.value === status);
    return option ? option.label : 'Không xác định';
  }

  getStatusBadgeClass(status: number): string {
    switch (status) {
      case 0:
        return 'badge bg-warning text-dark';
      case 1:
        return 'badge bg-info text-white';
      case 2:
        return 'badge bg-danger text-white';
      default:
        return 'badge bg-secondary text-white';
    }
  }

  // Pagination methods
  firstPage(): void {
    this.currentPage = 0;
    this.loadBookings();
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadBookings();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadBookings();
    }
  }

  lastPage(): void {
    this.currentPage = this.totalPages - 1;
    this.loadBookings();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadBookings();
  }

  getPaginationNumbers(): number[] {
    const pages: number[] = [];
    const maxDisplayPages = 5;
    let startPage = Math.max(0, this.currentPage - Math.floor(maxDisplayPages / 2));
    const endPage = Math.min(this.totalPages, startPage + maxDisplayPages);

    if (endPage - startPage < maxDisplayPages) {
      startPage = Math.max(0, endPage - maxDisplayPages);
    }

    for (let i = startPage; i < endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}
