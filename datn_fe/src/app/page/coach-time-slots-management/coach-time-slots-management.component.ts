import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TimeSlotsSubjectService, TimeSlotsSubject } from '../../service/time-slots-subject/time-slots-subject.service';
import { AuthService } from '../../service/auth/auth.service';
import { SubjectService } from '../../service/subject/subject.service';

interface TimetableSlot {
  timeRange: string;
  dayIndex: number;
  slotData: TimeSlotsSubjectWithTimeSlot | null;
}

interface TimeSlotsSubjectWithTimeSlot extends TimeSlotsSubject {
  date?: string;
  startTime?: string;
  endTime?: string;
  dayOfWeek?: number;
  subjectName?: string;
}

@Component({
  selector: 'app-coach-time-slots-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './coach-time-slots-management.component.html',
  styleUrl: './coach-time-slots-management.component.scss'
})
export class CoachTimeSlotsManagementComponent implements OnInit, OnDestroy {
  timetableData: TimeSlotsSubjectWithTimeSlot[] = [];
  filteredTimeSlots: TimeSlotsSubjectWithTimeSlot[] = [];
  isLoading = false;
  selectedSlot: TimeSlotsSubjectWithTimeSlot | null = null;
  showEditModal = false;
  editFormData = {
    id: 0,
    maxCapacity: 0,
    currentCapacity: 0,
    trainingMethods: 'OFFLINE'
  };

  // Search and filter
  searchDate: string = '';
  searchSubjectName: string = '';
  searchMethod: string = '';
  searchStatus: string = '';

  // Timetable structure
  weekDays = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
  timeRanges: string[] = [];
  timetable: Map<string, Map<number, TimeSlotsSubjectWithTimeSlot | null>> = new Map();

  // Subject filter
  coachSubjects: any[] = [];

  // Hover tooltip
  hoverSlot: TimeSlotsSubjectWithTimeSlot | null = null;
  hoverPosition: { x: number; y: number } = { x: 0, y: 0 };

  // Today's date for disabling past slots
  today: Date = new Date();

  // Pagination properties
  currentPage = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50, 100];
  totalElements = 0;
  totalPages = 0;

  trainingMethodOptions = [
    { value: 'ONLINE', label: 'Online' },
    { value: 'OFFLINE', label: 'Offline' }
  ];

  private destroy$ = new Subject<void>();
  private currentCoachId: number = 0;
  private subjectMap: Map<number, string> = new Map();

  constructor(
    private timeSlotsSubjectService: TimeSlotsSubjectService,
    private authService: AuthService,
    private subjectService: SubjectService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getCurrentUserId();
    this.currentCoachId = userId || 0;
    this.loadCoachSubjects();
    this.loadCoachTimeSlots();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCoachSubjects(): void {
    this.subjectService.getAllSubjects({page: 0, size: 1000})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.coachSubjects = response.data;
            // Build subject map for quick lookup
            response.data.forEach((subject: any) => {
              this.subjectMap.set(subject.id, subject.name);
            });
          }
        },
        error: (error) => {
          console.error('Error loading subjects:', error);
        }
      });
  }

  loadCoachTimeSlots(): void {
    this.isLoading = true;
    const request = {
      coachId: this.currentCoachId,
      page: this.currentPage,
      size: this.pageSize,
      date: this.searchDate || undefined,
      subjectName: this.searchSubjectName || undefined,
      trainingMethods: this.searchMethod || undefined,
      status: this.searchStatus || undefined
    };

    this.timeSlotsSubjectService.getCoachTimeSlotsWithPagination(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.timetableData = response.data;
            // Data is already filtered by API, no need for client-side filtering
            this.filteredTimeSlots = response.data;
            this.totalElements = response.count || 0;
            this.totalPages = Math.ceil(this.totalElements / this.pageSize);
            this.buildTimetable(response.data);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading time slots:', error);
          this.toastr.error('Lỗi tải khung giờ');
          this.isLoading = false;
        }
      });
  }

  buildTimetable(timeSlots: any[]): void {
    // Initialize timetable structure
    this.timetable.clear();
    const timeRangesSet = new Set<string>();
    const timeSlotMap = new Map<string, Map<number, any>>();

    // Group by time range and day
    timeSlots.forEach((slot: any) => {
      try {
        const timeRange = this.getTimeRange(slot.startTime);
        const date = new Date(slot.date);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ...

        // Convert to our week order (Monday = 0, Sunday = 6)
        const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        timeRangesSet.add(timeRange);

        if (!timeSlotMap.has(timeRange)) {
          timeSlotMap.set(timeRange, new Map());
        }

        timeSlotMap.get(timeRange)!.set(adjustedDay, {
          ...slot,
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          dayOfWeek: adjustedDay
        });
      } catch (error) {
        console.error('Error processing slot:', slot, error);
      }
    });

    // Sort time ranges
    this.timeRanges = Array.from(timeRangesSet).sort((a, b) => {
      const aStart = parseInt(a.split('-')[0]);
      const bStart = parseInt(b.split('-')[0]);
      return aStart - bStart;
    });

    // Fill in empty slots
    this.timeRanges.forEach(timeRange => {
      const dayMap = timeSlotMap.get(timeRange) || new Map();
      for (let day = 0; day < 7; day++) {
        if (!dayMap.has(day)) {
          dayMap.set(day, null);
        }
      }
      this.timetable.set(timeRange, dayMap);
    });
  }

  getTimeRange(startTimeStr: string): string {
    try {
      const date = new Date(startTimeStr);
      const hour = date.getHours();
      const nextHour = hour + 1;
      return `${hour}.00${hour < 12 ? 'am' : 'pm'} - ${nextHour}.00${nextHour < 12 ? 'am' : 'pm'}`;
    } catch {
      return 'Unknown';
    }
  }

  getSlotClass(timeRangeIndex: number, dayIndex: number): string {
    const timeRange = this.timeRanges[timeRangeIndex];
    const slotData = this.timetable.get(timeRange)?.get(dayIndex);

    if (!slotData) {
      return 'blank-td';
    }

    // Check if slot is in the past
    const isPast = this.isSlotPast(slotData);

    // Alternate dark/light rows
    let classes = ['hover-bg', 'ts-meta'];
    if (timeRangeIndex % 2 === 0) {
      classes.push('dark-bg');
    }
    if (isPast) {
      classes.push('disabled-slot');
    }
    return classes.join(' ');
  }

  getSlotData(timeRangeIndex: number, dayIndex: number): TimeSlotsSubjectWithTimeSlot | null {
    if (timeRangeIndex >= this.timeRanges.length) {
      return null;
    }
    const timeRange = this.timeRanges[timeRangeIndex];
    const slotData = this.timetable.get(timeRange)?.get(dayIndex) || null;

    // Return null if slot is in the past (to prevent editing)
    if (slotData && this.isSlotPast(slotData)) {
      return null;
    }

    return slotData;
  }

  openEditModal(slot: TimeSlotsSubjectWithTimeSlot | null): void {
    if (!slot) {
      this.toastr.warning('Khung giờ không có dữ liệu');
      return;
    }

    // Check if slot is in the past
    const slotDate = new Date(slot.date || '');
    slotDate.setHours(0, 0, 0, 0);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    if (slotDate < todayDate) {
      this.toastr.warning('Không thể sửa khung giờ trong quá khứ');
      return;
    }

    this.selectedSlot = slot;
    this.editFormData = {
      id: slot.id || 0,
      maxCapacity: slot.maxCapacity || 0,
      currentCapacity: slot.currentCapacity || 0,
      trainingMethods: slot.trainingMethods || 'OFFLINE'
    };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedSlot = null;
    this.editFormData = {
      id: 0,
      maxCapacity: 0,
      currentCapacity: 0,
      trainingMethods: 'OFFLINE'
    };
  }

  saveChanges(): void {
    if (this.editFormData.id <= 0) {
      this.toastr.warning('Khung giờ không hợp lệ');
      return;
    }

    if (this.editFormData.maxCapacity < 0) {
      this.toastr.warning('Sức chứa phải >= 0');
      return;
    }

    if (this.editFormData.currentCapacity < 0) {
      this.toastr.warning('Số học viên đã đăng ký phải >= 0');
      return;
    }

    if (this.editFormData.currentCapacity > this.editFormData.maxCapacity) {
      this.toastr.warning('Số học viên đã đăng ký không được vượt quá sức chứa tối đa');
      return;
    }

    this.timeSlotsSubjectService.update({
      id: this.editFormData.id,
      maxCapacity: this.editFormData.maxCapacity,
      currentCapacity: this.editFormData.currentCapacity,
      trainingMethods: this.editFormData.trainingMethods
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Cập nhật khung giờ thành công');
          this.closeEditModal();
          this.loadCoachTimeSlots();
        },
        error: (error) => {
          console.error('Error updating time slot:', error);
          this.toastr.error('Lỗi cập nhật khung giờ');
        }
      });
  }

  formatTime(timeStr: string | undefined): string {
    if (!timeStr) {
      return 'Unknown';
    }
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  }

  /**
   * Check if a slot date is in the past
   */
  isSlotPast(slot: TimeSlotsSubjectWithTimeSlot | null): boolean {
    if (!slot || !slot.date) {
      return false;
    }
    const slotDate = new Date(slot.date);
    slotDate.setHours(0, 0, 0, 0);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    return slotDate < todayDate;
  }

  /**
   * Handle mouse enter on slot to show tooltip
   */
  onSlotMouseEnter(event: MouseEvent, slot: TimeSlotsSubjectWithTimeSlot | null): void {
    if (!slot) {
      this.hoverSlot = null;
      return;
    }

    this.hoverSlot = slot;
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.hoverPosition = {
      x: rect.left,
      y: rect.top
    };
  }

  /**
   * Handle mouse leave on slot to hide tooltip
   */
  onSlotMouseLeave(): void {
    this.hoverSlot = null;
  }

  /**
   * Get training method label
   */
  getTrainingMethodLabel(method: string | undefined): string {
    if (!method) return 'Offline';
    return method === 'ONLINE' ? 'Online' : 'Offline';
  }

  /**
   * Get slot status (available or full) - based on capacity only
   */
  getSlotStatus(slot: TimeSlotsSubjectWithTimeSlot): string {
    if (slot.currentCapacity >= slot.maxCapacity) {
      return 'Đầy';
    }
    return 'Còn Chỗ';
  }

  /**
   * Get CSS class for capacity badge
   */
  getCapacityBadgeClass(slot: TimeSlotsSubjectWithTimeSlot): string {
    if (this.isSlotPast(slot)) {
      return 'bg-secondary';
    }
    if (slot.currentCapacity >= slot.maxCapacity) {
      return 'bg-danger';
    }
    return 'bg-success';
  }

  /**
   * Get CSS class for status badge - based on capacity only
   */
  getStatusBadgeClass(slot: TimeSlotsSubjectWithTimeSlot): string {
    if (slot.currentCapacity >= slot.maxCapacity) {
      return 'bg-danger';
    }
    return 'bg-success';
  }

  /**
   * Search and filter time slots - Calls API with current filters
   */
  onSearch(): void {
    // Reset to first page when searching with new filters
    this.currentPage = 0;
    // Call API to fetch filtered data
    this.loadCoachTimeSlots();
  }

  /**
   * Reset all filters and reload from API
   */
  onReset(): void {
    this.searchDate = '';
    this.searchSubjectName = '';
    this.searchMethod = '';
    this.searchStatus = '';
    this.currentPage = 0;
    this.loadCoachTimeSlots();
  }

  /**
   * Apply filters - Now mostly handled by API
   * This method can be used for client-side sorting if needed
   */
  applyFilters(): void {
    // All filtering is now done by API call in loadCoachTimeSlots()
    // This method is kept for potential client-side sorting enhancements

    // Optional: Sort by date and time if needed
    if (this.filteredTimeSlots && this.filteredTimeSlots.length > 0) {
      this.filteredTimeSlots.sort((a, b) => {
        const dateA = new Date(a.date || '').getTime();
        const dateB = new Date(b.date || '').getTime();
        if (dateA !== dateB) {
          return dateA - dateB;
        }
        const timeA = new Date(a.startTime || '').getTime();
        const timeB = new Date(b.startTime || '').getTime();
        return timeA - timeB;
      });
    }
  }

  /**
   * Go to next page
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadCoachTimeSlots();
    }
  }

  /**
   * Go to previous page
   */
  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadCoachTimeSlots();
    }
  }

  /**
   * Go to first page
   */
  firstPage(): void {
    if (this.currentPage > 0) {
      this.currentPage = 0;
      this.loadCoachTimeSlots();
    }
  }

  /**
   * Go to last page
   */
  lastPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage = this.totalPages - 1;
      this.loadCoachTimeSlots();
    }
  }

  /**
   * Change page size and reset to first page
   */
  changePageSize(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 0;
    this.loadCoachTimeSlots();
  }

  /**
   * Go to specific page
   */
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadCoachTimeSlots();
    }
  }

  /**
   * Generate pagination numbers to display
   */
  getPaginationNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 0; i < this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show current page and surrounding pages
      let startPage = Math.max(0, this.currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(this.totalPages - 1, startPage + maxPagesToShow - 1);

      // Adjust start page if we're near the end
      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(0, endPage - maxPagesToShow + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  protected readonly Math = Math;
}
