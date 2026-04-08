import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavComponent } from '../share/nav/nav.component';
import { FooterComponent } from '../share/footer/footer.component';
import { GymRoomService, GymRoom } from '../../service/gym-room/gym-room.service';

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
    private gymRoomService: GymRoomService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadRooms();
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
    if (room.currentMembers < room.capacity) {
      if (room.zoomLink) {
        if (isPlatformBrowser(this.platformId)) {
          window.open(room.zoomLink, '_blank');
        }
      } else {
        alert('Liên kết Zoom sẽ được cung cấp trước khi bắt đầu lớp');
      }
    } else {
      alert('Phòng tập đã đầy!');
    }
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







