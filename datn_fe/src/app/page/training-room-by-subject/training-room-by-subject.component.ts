import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavComponent } from '../share/nav/nav.component';
import { FooterComponent } from '../share/footer/footer.component';
import { TrainingRoomService } from '../../service/training-room/training-room.service';
import { AuthService } from '../../service/auth/auth.service';
import { TrainingRoom } from '../../model/training-room.model';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-training-room-by-subject',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NavComponent,
    FooterComponent
  ],
  templateUrl: './training-room-by-subject.component.html',
  styleUrls: ['./training-room-by-subject.component.scss']
})
export class TrainingRoomBySubjectComponent implements OnInit, OnDestroy {
  rooms: TrainingRoom[] = [];
  filteredRooms: TrainingRoom[] = [];
  isLoading = true;
  errorMessage = '';
  currentUser: any = null;
  userSubjectId: number | null = null;

  // Filter properties
  selectedStatus = 'ALL';
  searchKeyword = '';
  availableStatuses = [
    { value: 'ALL', label: 'Tất Cả' },
    { value: 'ACTIVE', label: 'Hoạt Động' },
    { value: 'INACTIVE', label: 'Không Hoạt Động' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private trainingRoomService: TrainingRoomService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Get current user
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user && user.id) {
          this.loadTrainingRoomsForUser();
        }
      });

    // If user is already logged in, load immediately
    const storedUser = this.authService.getCurrentUser();
    if (storedUser && storedUser.id) {
      this.currentUser = storedUser;
      this.loadTrainingRoomsForUser();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load training rooms based on user's enrolled subjects
   */
  loadTrainingRoomsForUser(): void {
    if (!this.currentUser || !this.currentUser.id) {
      this.errorMessage = 'Người dùng chưa đăng nhập';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Load rooms for the user based on their enrolled subjects
    this.trainingRoomService.getOnlineRoomsForUser(this.currentUser.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response && response.data) {
            this.rooms = response.data;
          } else if (Array.isArray(response)) {
            this.rooms = response;
          } else {
            this.rooms = [];
          }
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading training rooms:', error);
          this.errorMessage = 'Không thể tải phòng tập. Vui lòng thử lại sau.';
          this.isLoading = false;
        }
      });
  }

  /**
   * Load training rooms for a specific subject
   */
  loadTrainingRoomsBySubject(subjectId: number): void {
    if (!this.currentUser || !this.currentUser.id) {
      this.errorMessage = 'Người dùng chưa đăng nhập';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.trainingRoomService.getOnlineRoomsForUserBySubject(this.currentUser.id, subjectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response && response.data) {
            this.rooms = response.data;
          } else if (Array.isArray(response)) {
            this.rooms = response;
          } else {
            this.rooms = [];
          }
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading training rooms by subject:', error);
          this.errorMessage = 'Không thể tải phòng tập cho bộ môn này. Vui lòng thử lại sau.';
          this.isLoading = false;
        }
      });
  }

  /**
   * Apply filters to rooms list
   */
  applyFilters(): void {
    let filtered = [...this.rooms];

    // Filter by status
    if (this.selectedStatus !== 'ALL') {
      filtered = filtered.filter(room => room.status === this.selectedStatus);
    }

    // Filter by search keyword
    if (this.searchKeyword.trim()) {
      const keyword = this.searchKeyword.toLowerCase();
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(keyword) ||
        (room.description && room.description.toLowerCase().includes(keyword))
      );
    }

    this.filteredRooms = filtered;
  }

  /**
   * Handle filter change
   */
  onFilterChange(): void {
    this.applyFilters();
  }

  /**
   * Handle search input
   */
  onSearchChange(): void {
    this.applyFilters();
  }

  /**
   * Reset filters
   */
  resetFilters(): void {
    this.selectedStatus = 'ALL';
    this.searchKeyword = '';
    this.applyFilters();
  }

  /**
   * Join a training room
   */
  onJoinRoom(room: TrainingRoom): void {
    if (room.currentCapacity && room.currentCapacity >= room.maxCapacity) {
      alert('Phòng tập đã đầy!');
      return;
    }

    if (room.zoomLink) {
      if (isPlatformBrowser(this.platformId)) {
        window.open(room.zoomLink, '_blank');
      }
    } else {
      alert('Liên kết Zoom sẽ được cung cấp trước khi bắt đầu lớp');
    }
  }

  /**
   * Get button text based on room capacity
   */
  getButtonText(room: TrainingRoom): string {
    const currentCapacity = room.currentCapacity || 0;
    if (currentCapacity >= room.maxCapacity) {
      return 'Đã Đầy';
    }
    return 'Tham Gia';
  }

  /**
   * Check if join button should be disabled
   */
  getButtonDisabled(room: TrainingRoom): boolean {
    const currentCapacity = room.currentCapacity || 0;
    return currentCapacity >= room.maxCapacity;
  }

  /**
   * Get capacity percentage for progress bar
   */
  getCapacityPercentage(room: TrainingRoom): number {
    const currentCapacity = room.currentCapacity || 0;
    return (currentCapacity / room.maxCapacity) * 100;
  }

  /**
   * Check if room is full
   */
  isRoomFull(room: TrainingRoom): boolean {
    const currentCapacity = room.currentCapacity || 0;
    return currentCapacity >= room.maxCapacity;
  }

  /**
   * Get available slots count
   */
  getAvailableSlots(room: TrainingRoom): number {
    const currentCapacity = room.currentCapacity || 0;
    return Math.max(0, room.maxCapacity - currentCapacity);
  }

  /**
   * Deduplicate rooms by ID
   */
  deduplicateRooms(rooms: TrainingRoom[]): TrainingRoom[] {
    const uniqueIds = new Set<number>();
    return rooms.filter(room => {
      if (!room.id) {
        return false;
      }
      if (uniqueIds.has(room.id)) {
        return false;
      } else {
        uniqueIds.add(room.id);
        return true;
      }
    });
  }
}
