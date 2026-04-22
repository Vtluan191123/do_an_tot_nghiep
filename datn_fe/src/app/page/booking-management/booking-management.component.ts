import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../service/booking/booking.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

interface Booking {
  id?: number;
  userId: number;
  userName?: string;
  subjectId: number;
  subjectName?: string;
  timeSlotSubjectId: number;
  timeSlotStart?: string; // ISO datetime from backend
  timeSlotEnd?: string;   // ISO datetime from backend
  maxCapacity?: number;
  currentCapacity?: number;
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
  private filterSubject$ = new Subject<void>();

  constructor(
    private bookingService: BookingService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Setup filter subscription with debounce (800ms) to call API on filter changes
    this.filterSubject$
      .pipe(
        debounceTime(800),
        distinctUntilChanged(),
        switchMap(() => {
          this.currentPage = 0;
          return this.getBookingsWithFilters();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.filteredBookings = response.data;
            this.totalElements = response.count || 0;
            this.totalPages = response.totalPages || 0;
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading bookings:', error);
          this.toastr.error('Lỗi tải danh sách đặt lịch');
          this.isLoading = false;
        }
      });

    // Load initial bookings
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
            this.filteredBookings = response.data;
            this.totalElements = response.count || 0;
            this.totalPages = response.totalPages || 0;
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

  /**
   * Build filter request and call API with current filter values
   */
  getBookingsWithFilters() {
    this.isLoading = true;
    const filter: any = {
      page: this.currentPage,
      size: this.pageSize,
      sortBy: 'id',
      sortDirection: 'DESC'
    };

    // Add keyword filter (search username)
    if (this.searchUsername && this.searchUsername.trim()) {
      filter.keyword = this.searchUsername.trim();
    }

    // Add status filter
    if (this.searchStatus !== '') {
      filter.status = parseInt(this.searchStatus, 10);
    }

    // Add date range filters if needed (backend should handle these)
    // For now, client-side filtering for dates
    if (this.searchFromDate || this.searchToDate) {
      filter.fromDate = this.searchFromDate;
      filter.toDate = this.searchToDate;
    }

    return this.bookingService.getAllBookingsWithJoin(filter);
  }

  /**
   * Trigger filter change - debounced API call
   */
  onFilterChange(): void {
    this.filterSubject$.next();
  }

  /**
   * Manual search button click - immediate API call
   */
  onSearch(): void {
    this.currentPage = 0;
    this.getBookingsWithFilters()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.filteredBookings = response.data;
            this.totalElements = response.count || 0;
            this.totalPages = response.totalPages || 0;
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

  /**
   * Reset all filters and reload bookings
   */
  onReset(): void {
    this.searchUsername = '';
    this.searchStatus = '';
    this.searchFromDate = '';
    this.searchToDate = '';
    this.currentPage = 0;
    this.onFilterChange();
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
