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
  startTime?: string;
  endTime?: string;
}

interface TimetableRow {
  timeSlot: string;
  timeRangeDisplay: string;
  cells: (TimetableCell | null)[];
}

interface FilterSubject {
  subjectId: number;
  subjectName: string;
}

interface WeekInfo {
  startDate: Date;
  endDate: Date;
  startDateStr: string;
  endDateStr: string;
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
  dayLabelsWithDate: string[] = [];

  // Filter subjects from user's enrolled subjects
  filterSubjects: FilterSubject[] = [];
  selectedSubjectId: number | null = null;

  // Week navigation
  currentWeekIndex = 0; // 0 = current week, -1 = previous, 1 = next, etc.
  weekLabel = 'Tuần Này';
  weekInfo: WeekInfo | null = null;

  isBookingModalOpen = false;
  selectedTimeslot: any = null;

  isLoading = true;
  errorMessage = '';

  // Fixed time slots for timetable - 5:00 AM to 12:00 AM (24:00)
  readonly TIME_SLOTS = [
    { startHour: 5, endHour: 6, display: '5:00 - 6:00' },
    { startHour: 6, endHour: 7, display: '6:00 - 7:00' },
    { startHour: 7, endHour: 8, display: '7:00 - 8:00' },
    { startHour: 8, endHour: 9, display: '8:00 - 9:00' },
    { startHour: 9, endHour: 10, display: '9:00 - 10:00' },
    { startHour: 10, endHour: 11, display: '10:00 - 11:00' },
    { startHour: 11, endHour: 12, display: '11:00 - 12:00' },
    { startHour: 12, endHour: 13, display: '12:00 - 1:00 PM' },
    { startHour: 13, endHour: 14, display: '1:00 - 2:00 PM' },
    { startHour: 14, endHour: 15, display: '2:00 - 3:00 PM' },
    { startHour: 15, endHour: 16, display: '3:00 - 4:00 PM' },
    { startHour: 16, endHour: 17, display: '4:00 - 5:00 PM' },
    { startHour: 17, endHour: 18, display: '5:00 - 6:00 PM' },
    { startHour: 18, endHour: 19, display: '6:00 - 7:00 PM' },
    { startHour: 19, endHour: 20, display: '7:00 - 8:00 PM' },
    { startHour: 20, endHour: 21, display: '8:00 - 9:00 PM' },
    { startHour: 21, endHour: 22, display: '9:00 - 10:00 PM' },
    { startHour: 22, endHour: 23, display: '10:00 - 11:00 PM' },
    { startHour: 23, endHour: 24, display: '11:00 PM - 12:00 AM' }
  ];

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
   * Blocked if current week (cannot go to past)
   */
  previousWeek(): void {
    if (this.currentWeekIndex === 0) {
      // Already at current week, cannot go to past
      return;
    }
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
   */
  private loadTimetableForWeek(): void {
    if (!this.selectedSubjectId) return;

    this.isLoading = true;
    this.errorMessage = '';

    // Get week date range info
    this.weekInfo = this.getWeekDateRange(this.currentWeekIndex);

    // Load timeslots for subject filtered by week
    this.timeSlotsSubjectService.getCoachTimeSlotsWithPagination({
      subjectId: this.selectedSubjectId,
      date: this.weekInfo.startDate.toISOString().split('T')[0], // YYYY-MM-DD format
      page: 0,
      size: 100 // Enough for a week
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const timeslots = response.data || [];
          this.buildTimetable(timeslots);
          this.updateDayLabels();
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
   * Update day labels with dates - Generate labels for each day of the week
   */
  private updateDayLabels(): void {
    if (!this.weekInfo) return;

    this.dayLabelsWithDate = [];
    const startDate = new Date(this.weekInfo.startDate);
    startDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate.getTime()); // Clone date properly
      currentDate.setDate(startDate.getDate() + i);
      const dayName = this.daysOfWeek[i]; // Monday, Tuesday, etc.
      const dateStr = currentDate.toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit' });
      this.dayLabelsWithDate.push(`${dayName} (${dateStr})`);
    }
  }

  /**
   * Calculate start and end date of a week
   * weekIndex: 0 = current week, 1 = next week, -1 = previous week, etc.
   */
  private getWeekDateRange(weekIndex: number): WeekInfo {
    const today = new Date();

    // Get current day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const currentDayOfWeek = today.getDay();

    // Calculate how many days back to Monday (day 1)
    // If Monday = 1, then offset = (currentDay - 1)
    // If Sunday = 0, then offset = -6 (Sunday is end of week)
    const daysUntilMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;

    // Get Monday of current week
    const mondayOfCurrentWeek = new Date(today);
    mondayOfCurrentWeek.setDate(today.getDate() + daysUntilMonday);
    mondayOfCurrentWeek.setHours(0, 0, 0, 0); // Reset time to start of day

    // Apply week offset to get the start date
    const startDate = new Date(mondayOfCurrentWeek);
    startDate.setDate(mondayOfCurrentWeek.getDate() + weekIndex * 7);

    // End date is Sunday (6 days after Monday)
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    // Format date strings for display (e.g., "Thứ Hai 21/04")
    const startDateStr = startDate.toLocaleDateString('vi-VN', {
      weekday: 'short',
      month: '2-digit',
      day: '2-digit'
    });
    const endDateStr = endDate.toLocaleDateString('vi-VN', {
      weekday: 'short',
      month: '2-digit',
      day: '2-digit'
    });

    return { startDate, endDate, startDateStr, endDateStr };
  }

  /**
   * Build timetable from timeslots data
   */
  private buildTimetable(timeslots: TimeSlotsSubject[]): void {
    // Initialize timetable rows
    this.timetableRows = this.TIME_SLOTS.map(ts => ({
      timeSlot: ts.display,
      timeRangeDisplay: `${ts.startHour}:00 - ${ts.endHour}:00`,
      cells: Array(7).fill(null)
    }));

    if (!this.weekInfo) return;

    // Fill in the timetable with actual data
    timeslots.forEach(timeslot => {
      if (!timeslot.id) return;

      // Use date from TimeSlots object
      let slotDate: Date;
      if (timeslot.date) {
        // Parse date from YYYY-MM-DD format
        const [year, month, day] = timeslot.date.split('-').map(Number);
        slotDate = new Date(year, month - 1, day);
        slotDate.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
      } else {
        return; // Skip if no date available
      }

      const startDateOfWeek = new Date(this.weekInfo!.startDate);
      startDateOfWeek.setHours(0, 0, 0, 0); // Ensure clean comparison

      // Calculate day of week relative to week start (0 = Monday, 6 = Sunday)
      const dayDiff = Math.floor((slotDate.getTime() - startDateOfWeek.getTime()) / (1000 * 60 * 60 * 24));

      // Check if the timeslot is within this week
      if (dayDiff < 0 || dayDiff >= 7) {
        console.log(`Timeslot date ${timeslot.date} not in week, dayDiff=${dayDiff}`);
        return;
      }

      // Extract time from startTime (ISO format or HH:mm)
      let timeStr = '';
      let hours = 0;

      if (timeslot.startTime) {
        // Handle ISO format: 2024-04-21T06:00:00
        if (timeslot.startTime.includes('T')) {
          timeStr = timeslot.startTime.substring(11, 16); // Extract HH:mm
          hours = parseInt(timeStr.split(':')[0]);
        }
        // Handle HH:mm format
        else if (timeslot.startTime.includes(':')) {
          timeStr = timeslot.startTime.substring(0, 5); // Get HH:mm
          hours = parseInt(timeStr.split(':')[0]);
        } else {
          return;
        }
      } else {
        return; // Skip if no startTime
      }

      // Find matching time slot
      let timeSlotIndex = -1;
      for (let i = 0; i < this.TIME_SLOTS.length; i++) {
        const slot = this.TIME_SLOTS[i];
        if (hours >= slot.startHour && hours < slot.endHour) {
          timeSlotIndex = i;
          break;
        }
      }

      if (timeSlotIndex >= 0 && dayDiff >= 0 && dayDiff < 7) {
        // Extract end time as well
        let endTimeStr = '';
        if (timeslot.endTime) {
          if (timeslot.endTime.includes('T')) {
            endTimeStr = timeslot.endTime.substring(11, 16);
          } else if (timeslot.endTime.includes(':')) {
            endTimeStr = timeslot.endTime.substring(0, 5);
          }
        }

        const cell: TimetableCell = {
          timeSlotsSubjectId: timeslot.id,
          subjectId: timeslot.subjectId,
          subjectName: timeslot.subjectName || 'N/A',
          coachFullName: timeslot.coachFullName || 'N/A',
          currentCapacity: timeslot.currentCapacity,
          maxCapacity: timeslot.maxCapacity,
          trainingMethods: timeslot.trainingMethods,
          timeSlotDate: slotDate.toLocaleDateString('vi-VN'),
          timeSlotTime: timeStr,
          dayOfWeek: dayDiff,
          dayName: this.daysOfWeek[dayDiff],
          startTime: timeStr,
          endTime: endTimeStr || `${this.TIME_SLOTS[timeSlotIndex].endHour}:00`
        };

        // If cell already exists, merge or replace
        if (this.timetableRows[timeSlotIndex].cells[dayDiff]) {
          // Cell already exists, keep existing or update based on capacity
          const existing = this.timetableRows[timeSlotIndex].cells[dayDiff];
          if (cell.currentCapacity < existing!.currentCapacity) {
            this.timetableRows[timeSlotIndex].cells[dayDiff] = cell;
          }
        } else {
          this.timetableRows[timeSlotIndex].cells[dayDiff] = cell;
        }
      }
    });
  }

  private buildEmptyTimetable(): void {
    this.timetableRows = this.TIME_SLOTS.map(ts => ({
      timeSlot: ts.display,
      timeRangeDisplay: `${ts.startHour}:00 - ${ts.endHour}:00`,
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
      currentCapacity: cell.currentCapacity,
      trainingMethod: cell.trainingMethods,
      coach: cell.coachFullName,
      date: cell.timeSlotDate,
      time: cell.timeSlotTime,
      startTime: cell.startTime,
      endTime: cell.endTime
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

