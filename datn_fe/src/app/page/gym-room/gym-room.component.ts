import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavComponent } from '../share/nav/nav.component';
import { FooterComponent } from '../share/footer/footer.component';
import { GymRoomService, GymRoom } from '../../service/gym-room/gym-room.service';
import { TrainingRoomService } from '../../service/training-room/training-room.service';
import { AuthService } from '../../service/auth/auth.service';
import { RoleUtil } from '../../util/role.util';

@Component({
  selector: 'app-gym-room',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NavComponent,
    FooterComponent
  ],
  templateUrl: './gym-room.component.html',
  styleUrls: ['./gym-room.component.scss']
})
export class GymRoomComponent implements OnInit {
  rooms: GymRoom[] = [];
  createRoomForm!: FormGroup;
  showCreateForm = false;
  isLoading = false;
  userRole: string = '';
  currentUserId: number | null = null;

  subjects = [
    'Fitness',
    'Yoga',
    'Boxing',
    'Karate',
    'Body Building',
    'Cardio',
    'Crossfit'
  ];

  constructor(
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object,
    private gymRoomService: GymRoomService,
    private trainingRoomService: TrainingRoomService,
    private authService: AuthService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    // Get current user info
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUserId = currentUser.id;
      if (currentUser.roleId) {
        this.userRole = this.getRoleFromRoleId(currentUser.roleId);
      }
    }

    // Load rooms based on user role
    this.loadRooms();
  }

  /**
   * Convert roleId to role string
   */
  private getRoleFromRoleId(roleId: any): string {
    return RoleUtil.getRoleFromRoleId(roleId);
  }

  initForm(): void {
    this.createRoomForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      subject: ['', Validators.required],
      instructor: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      capacity: [20, [Validators.required, Validators.min(5), Validators.max(100)]],
      description: [''],
      image: ['']
    });
  }

  loadRooms(): void {
    // If user is COACH, fetch their training rooms by coachId
    if (this.userRole === 'ROLE_COACH' && this.currentUserId) {
      this.trainingRoomService.getByCoachId(this.currentUserId).subscribe({
        next: (response: any) => {
          // Map training room response to GymRoom interface
          if (response && response.data) {
            this.rooms = response.data.map((tr: any) => ({
              id: tr.id?.toString(),
              name: tr.name,
              subject: tr.subjectId?.toString() || '',
              instructor: '', // Can be fetched from trainer info if available
              startTime: '', // Would need to get from timeslots
              endTime: '', // Would need to get from timeslots
              capacity: tr.maxCapacity || 0,
              currentMembers: tr.currentCapacity || 0,
              image: 'assets/img/classes/default.jpg',
              zoomLink: tr.zoomLink,
              description: tr.description
            }));
            console.log('✓ Training rooms loaded for Coach:', this.rooms.length);
          }
        },
        error: (error) => {
          console.error('Error loading training rooms:', error);
          // Fallback to gym room service if API error
          this.loadGymRooms();
        }
      });
    } else {
      // For non-coach users, load from gym room service
      this.loadGymRooms();
    }
  }

  /**
   * Load gym rooms from local service
   */
  private loadGymRooms(): void {
    this.gymRoomService.getRooms().subscribe(rooms => {
      this.rooms = rooms;
    });
  }

  onCreateRoom(): void {
    if (this.createRoomForm.invalid) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    this.isLoading = true;

    // Simulate API call
    setTimeout(() => {
      const formValue = this.createRoomForm.value;
      const newRoom = {
        ...formValue,
        currentMembers: 1,
        image: 'assets/img/classes/default.jpg'
      };

      this.gymRoomService.addRoom(newRoom);
      this.createRoomForm.reset();
      this.showCreateForm = false;
      this.isLoading = false;
      alert('Tạo phòng tập thành công!');
    }, 1000);
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
  }

  onJoinRoom(room: GymRoom): void {
    // Check if room is full
    if (room.currentMembers >= room.capacity) {
      alert('Phòng tập đã đầy!');
      return;
    }

    // Get current user to pass full name
    const currentUser = this.authService.getCurrentUser();
    const userName = currentUser?.fullName || currentUser?.username || 'Guest';

    // Call API to get zoom/livekit link
    this.trainingRoomService.joinRoom(room.id, userName).subscribe({
      next: (response: any) => {
        if (response && response.urlRoom) {
          const zoomLink = response.urlRoom;
          if (isPlatformBrowser(this.platformId)) {
            window.open(zoomLink, '_blank');
          }
        } else {
          alert('Liên kết Zoom sẽ được cung cấp trước khi bắt đầu lớp');
        }
      },
      error: (error) => {
        console.error('Error joining room:', error);
        alert('Không thể tham gia phòng tập. Vui lòng thử lại sau.');
      }
    });
  }

  getButtonText(room: GymRoom): string {
    if (room.currentMembers >= room.capacity) {
      return 'Đã Đầy';
    }
    return 'Tham Gia';
  }

  getButtonDisabled(room: GymRoom): boolean {
    return room.currentMembers >= room.capacity;
  }
}







