import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingModalComponent } from '../../component/booking-modal/booking-modal.component';
import { TimeSlotsSubjectService, TimeSlotsSubject } from '../../service/time-slots-subject/time-slots-subject.service';
import { UserEnrolledSubjectService } from '../../service/user/user-enrolled-subject.service';
import { AuthService } from '../../service/auth/auth.service';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';

interface TimetableCell {
  timeSlotsSubjectId: number;
  subjectId: number;
  subjectName: string;
  coachFullName: string;
  currentCapacity: number;
  maxCapacity: number;
  trainingMethods: string;
  timeSlotDate: string;
  timeSlotTime: string;
  dayOfWeek: number;
  dayName: string;
}

interface TimetableRow {
  timeSlot: string;
  cells: (TimetableCell | null)[];
}

interface FilterSubject {
  subjectId: number;
  subjectName: string;
}

@Component({
  selector: 'app-class-timetable',
  standalone: true,
  imports: [CommonModule, BookingModalComponent],
  templateUrl: './class-timetable.component.html',
  styleUrls: ['./class-timetable.component.scss']
})
export class ClassTimetableComponent implements OnInit, OnDestroy {
  timetableRows: TimetableRow[] = [];
  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Filter subjects from user's enrolled subjects
  filterSubjects: FilterSubject[] = [];
  selectedSubjectId: number | null = null;

  // Week navigation
  currentWeekIndex = 0; // 0 = current week, -1 = previous, 1 = next, etc.
  weekLabel = 'Tuần Này';

  isBookingModalOpen = false;
  selectedTimeslot: any = null;

  isLoading = true;
  errorMessage = '';

  private destroy$ = new Subject<void>();
  private userId: number | null = null;

  constructor(
    private timeSlotsSubjectService: TimeSlotsSubjectService,
    private userEnrolledSubjectService: UserEnrolledSubjectService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getCurrentUserId();
    if (!this.userId) {
      this.errorMessage = 'Không thể xác định người dùng';
      this.isLoading = false;
      return;
    }
    this.loadEnrolledSubjects();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load enrolled subjects for current user
   */
  loadEnrolledSubjects(): void {
    if (!this.userId) return;

    this.userEnrolledSubjectService.getEnrolledSubjects(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
            this.filterSubjects = response.data.map((subject: any) => ({
              subjectId: subject.subjectId,
              subjectName: subject.subjectName
            }));
            // Auto-select first subject
            if (this.filterSubjects.length > 0) {
              this.onSubjectFilterClick(this.filterSubjects[0].subjectId);
            }
          } else {
            this.errorMessage = 'Bạn chưa đăng ký môn học nào';
            this.isLoading = false;
            this.buildEmptyTimetable();
          }
        },
        error: (error) => {
          console.error('Error loading enrolled subjects:', error);
          this.errorMessage = 'Lỗi tải danh sách môn học';
          this.isLoading = false;
          this.buildEmptyTimetable();
        }
      });
  }

  /**
   * Handle subject filter click
   */
  onSubjectFilterClick(subjectId: number): void {
    this.selectedSubjectId = subjectId;
    this.currentWeekIndex = 0; // Reset to current week when changing subject
    this.updateWeekLabel();
    this.loadTimetableForWeek();
  }

  /**
   * Navigate to previous week
   */
  previousWeek(): void {
    this.currentWeekIndex--;
    this.updateWeekLabel();
    this.loadTimetableForWeek();
  }

  /**
   * Navigate to next week
   */
  nextWeek(): void {
    this.currentWeekIndex++;
    this.updateWeekLabel();
    this.loadTimetableForWeek();
  }

  /**
   * Update week label display
   */
  private updateWeekLabel(): void {
    if (this.currentWeekIndex === 0) {
      this.weekLabel = 'Tuần Này';
    } else if (this.currentWeekIndex === -1) {
      this.weekLabel = 'Tuần Trước';
    } else if (this.currentWeekIndex === 1) {
      this.weekLabel = 'Tuần Sau';
    } else if (this.currentWeekIndex < -1) {
      this.weekLabel = `${Math.abs(this.currentWeekIndex)} tuần trước`;
    } else {
      this.weekLabel = `${this.currentWeekIndex} tuần sau`;
    }
  }

  /**
   * Load timeslot data for selected subject and week
   * Optimized API call: only fetch needed data
   */
  private loadTimetableForWeek(): void {
    if (!this.selectedSubjectId) return;

    this.isLoading = true;
    this.errorMessage = '';

    // Calculate date range for the week
    const { startDate, endDate } = this.getWeekDateRange(this.currentWeekIndex);
    const dateStr = startDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    // API call with filters: subject + date (week)
    // This avoids loading all records at once
    this.timeSlotsSubjectService.getCoachTimeSlotsWithPagination({
      subjectId: this.selectedSubjectId,
      date: dateStr, // Filter by week start date
      page: 0,
      size: 100 // Only need ~7-10 records per week
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const timeslots = response.data || [];
          this.buildTimetable(timeslots);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading timetable:', error);
          this.errorMessage = 'Lỗi tải dữ liệu lịch biểu';
          this.isLoading = false;
          this.buildEmptyTimetable();
        }
      });
  }

  /**
   * Calculate start and end date of a week
   * weekIndex: 0 = current week, 1 = next week, -1 = previous week, etc.
   */
  private getWeekDateRange(weekIndex: number): { startDate: Date; endDate: Date } {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Calculate Monday of current week
    const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const mondayOfCurrentWeek = new Date(today);
    mondayOfCurrentWeek.setDate(today.getDate() + mondayOffset);

    // Apply week offset
    const startDate = new Date(mondayOfCurrentWeek);
    startDate.setDate(mondayOfCurrentWeek.getDate() + weekIndex * 7);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // Saturday

    return { startDate, endDate };
  }

  /**
   * Build timetable from timeslots data
   */
  private buildTimetable(timeslots: TimeSlotsSubject[]): void {
    const timeSlots = [
      { startHour: 6, endHour: 8, display: '6:00 - 8:00' },
      { startHour: 10, endHour: 12, display: '10:00 - 12:00' },
      { startHour: 17, endHour: 19, display: '5:00 - 7:00' },
      { startHour: 19, endHour: 21, display: '7:00 - 9:00' }
    ];

    this.timetableRows = timeSlots.map(ts => {
      const cells: (TimetableCell | null)[] = Array(7).fill(null);
      return {
        timeSlot: ts.display,
        cells: cells
      };
    });

    // Fill in the timetable with actual data
    timeslots.forEach(timeslot => {
      if (!timeslot.id) return;

      const date = new Date(timeslot.createdAt || new Date());
      const dayOfWeek = date.getDay();
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      const timeStr = (timeslot.createdAt || '').substring(11, 16);
      let timeSlotIndex = -1;

      if (timeStr >= '06:00' && timeStr < '08:00') timeSlotIndex = 0;
      else if (timeStr >= '10:00' && timeStr < '12:00') timeSlotIndex = 1;
      else if (timeStr >= '17:00' && timeStr < '19:00') timeSlotIndex = 2;
      else if (timeStr >= '19:00' && timeStr < '21:00') timeSlotIndex = 3;

      if (timeSlotIndex >= 0 && adjustedDay >= 0 && adjustedDay < 7) {
        const cell: TimetableCell = {
          timeSlotsSubjectId: timeslot.id,
          subjectId: timeslot.subjectId,
          subjectName: timeslot.subjectName || 'N/A',
          coachFullName: timeslot.coachFullName || 'N/A',
          currentCapacity: timeslot.currentCapacity,
          maxCapacity: timeslot.maxCapacity,
          trainingMethods: timeslot.trainingMethods,
          timeSlotDate: date.toLocaleDateString('vi-VN'),
          timeSlotTime: timeStr,
          dayOfWeek: adjustedDay,
          dayName: this.daysOfWeek[adjustedDay]
        };

        this.timetableRows[timeSlotIndex].cells[adjustedDay] = cell;
      }
    });
  }

  private buildEmptyTimetable(): void {
    const timeSlots = [
      { startHour: 6, endHour: 8, display: '6:00 - 8:00' },
      { startHour: 10, endHour: 12, display: '10:00 - 12:00' },
      { startHour: 17, endHour: 19, display: '5:00 - 7:00' },
      { startHour: 19, endHour: 21, display: '7:00 - 9:00' }
    ];

    this.timetableRows = timeSlots.map(ts => ({
      timeSlot: ts.display,
      cells: Array(7).fill(null)
    }));
  }

  getCapacityPercentage(current: number, max: number): number {
    return Math.round((current / max) * 100);
  }

  getCapacityClass(current: number, max: number): string {
    const percentage = this.getCapacityPercentage(current, max);
    if (percentage >= 80) return 'capacity-full';
    if (percentage >= 50) return 'capacity-medium';
    return 'capacity-low';
  }

  onTimeslotClick(cell: TimetableCell): void {
    this.selectedTimeslot = {
      ...cell,
      maxCapacity: cell.maxCapacity,
      currentCapacity: cell.currentCapacity
    };
    this.isBookingModalOpen = true;
  }

  closeBookingModal(): void {
    this.isBookingModalOpen = false;
    this.selectedTimeslot = null;
  }

  onBookingSuccess(): void {
    this.loadTimetableForWeek();
  }
}

