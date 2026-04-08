import { TestBed } from '@angular/core/testing';

import { GymRoomService } from './gym-room.service';

describe('GymRoomService', () => {
  let service: GymRoomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GymRoomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load initial rooms', (done) => {
    service.getRooms().subscribe(rooms => {
      expect(rooms.length).toBe(3);
      done();
    });
  });

  it('should add a new room', (done) => {
    const newRoom = {
      name: 'Test Room',
      subject: 'Fitness',
      instructor: 'Test Instructor',
      startTime: '10:00 AM',
      endTime: '12:00 PM',
      capacity: 25,
      currentMembers: 0,
      image: 'test.jpg',
      description: 'Test Description'
    };

    service.addRoom(newRoom);

    service.getRooms().subscribe(rooms => {
      expect(rooms.length).toBe(4);
      expect(rooms[0].name).toBe('Test Room');
      done();
    });
  });

  it('should update room members', (done) => {
    service.updateRoomMembers('1', 18);

    service.getRooms().subscribe(rooms => {
      const room = rooms.find(r => r.id === '1');
      expect(room?.currentMembers).toBe(18);
      done();
    });
  });

  it('should delete a room', (done) => {
    service.deleteRoom('1');

    service.getRooms().subscribe(rooms => {
      expect(rooms.length).toBe(2);
      expect(rooms.find(r => r.id === '1')).toBeUndefined();
      done();
    });
  });

  it('should get room by id', () => {
    const room = service.getRoomById('1');
    expect(room).toBeDefined();
    expect(room?.name).toBe('Phòng Yoga Sáng');
  });
});

