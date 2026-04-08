import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface GymRoom {
  id: string;
  name: string;
  subject: string;
  instructor: string;
  startTime: string;
  endTime: string;
  capacity: number;
  currentMembers: number;
  image: string;
  zoomLink?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GymRoomService {
  private roomsSubject = new BehaviorSubject<GymRoom[]>([]);
  public rooms$ = this.roomsSubject.asObservable();

  constructor() {
    this.loadInitialRooms();
  }

  private loadInitialRooms(): void {
    const initialRooms: GymRoom[] = [
      {
        id: '1',
        name: 'Phòng Yoga Sáng',
        subject: 'Yoga',
        instructor: 'Nguyễn Văn A',
        startTime: '6:00 AM',
        endTime: '8:00 AM',
        capacity: 20,
        currentMembers: 15,
        image: 'assets/img/classes/1.jpg',
        zoomLink: 'https://zoom.us/j/123456789',
        description: 'Lớp yoga dành cho người mới bắt đầu'
      },
      {
        id: '2',
        name: 'Phòng Cardio Chiều',
        subject: 'Cardio',
        instructor: 'Trần Thị B',
        startTime: '5:00 PM',
        endTime: '7:00 PM',
        capacity: 30,
        currentMembers: 25,
        image: 'assets/img/classes/2.jpg',
        zoomLink: 'https://zoom.us/j/987654321',
        description: 'Bài tập cardio để tăng thể lực'
      },
      {
        id: '3',
        name: 'Phòng Boxing Tối',
        subject: 'Boxing',
        instructor: 'Lê Văn C',
        startTime: '7:00 PM',
        endTime: '9:00 PM',
        capacity: 15,
        currentMembers: 12,
        image: 'assets/img/classes/3.jpg',
        zoomLink: 'https://zoom.us/j/555555555',
        description: 'Huấn luyện boxing chuyên nghiệp'
      }
    ];
    this.roomsSubject.next(initialRooms);
  }

  getRooms(): Observable<GymRoom[]> {
    return this.rooms$;
  }

  addRoom(room: Omit<GymRoom, 'id'>): void {
    const newRoom: GymRoom = {
      id: Date.now().toString(),
      ...room
    } as GymRoom;

    const currentRooms = this.roomsSubject.value;
    this.roomsSubject.next([newRoom, ...currentRooms]);
  }

  updateRoomMembers(roomId: string, newMemberCount: number): void {
    const currentRooms = this.roomsSubject.value;
    const updatedRooms = currentRooms.map(room =>
      room.id === roomId
        ? { ...room, currentMembers: newMemberCount }
        : room
    );
    this.roomsSubject.next(updatedRooms);
  }

  deleteRoom(roomId: string): void {
    const currentRooms = this.roomsSubject.value;
    const filteredRooms = currentRooms.filter(room => room.id !== roomId);
    this.roomsSubject.next(filteredRooms);
  }

  getRoomById(roomId: string): GymRoom | undefined {
    return this.roomsSubject.value.find(room => room.id === roomId);
  }
}

