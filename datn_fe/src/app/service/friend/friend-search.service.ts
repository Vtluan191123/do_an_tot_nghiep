import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';

export interface Friend {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  location?: string;
  joinDate?: string;
  friendCount?: number;
  postCount?: number;
  isOnline?: boolean;
  isFriend?: boolean;
}

export interface FriendProfile extends Friend {
  email?: string;
  phone?: string;
  website?: string;
  followers?: number;
  following?: number;
}

@Injectable({
  providedIn: 'root'
})
export class FriendSearchService {
  private mockFriends: Friend[] = [
    {
      id: '1',
      name: 'Nguyễn Văn A',
      username: 'nguyenvana',
      avatar: 'assets/img/hero/hero-1.jpg',
      bio: 'Yêu thích fitness và gym',
      location: 'Hà Nội',
      joinDate: 'Tháng 1, 2025',
      friendCount: 125,
      postCount: 42,
      isOnline: true,
      isFriend: false
    },
    {
      id: '2',
      name: 'Trần Thị B',
      username: 'tranthib',
      avatar: 'assets/img/hero/hero-2.jpg',
      bio: 'Huấn luyện viên yoga chuyên nghiệp',
      location: 'TP Hồ Chí Minh',
      joinDate: 'Tháng 2, 2025',
      friendCount: 89,
      postCount: 156,
      isOnline: true,
      isFriend: false
    },
    {
      id: '3',
      name: 'Lê Văn C',
      username: 'levanc',
      avatar: 'assets/img/hero/hero-1.jpg',
      bio: 'Boxing trainer, health enthusiast',
      location: 'Đà Nẵng',
      joinDate: 'Tháng 3, 2025',
      friendCount: 203,
      postCount: 87,
      isOnline: false,
      isFriend: false
    },
    {
      id: '4',
      name: 'Phạm Thị D',
      username: 'phamthid',
      avatar: 'assets/img/hero/hero-2.jpg',
      bio: 'Fitness enthusiast',
      location: 'Hải Phòng',
      joinDate: 'Tháng 4, 2025',
      friendCount: 64,
      postCount: 23,
      isOnline: true,
      isFriend: true
    },
    {
      id: '5',
      name: 'Trương Văn E',
      username: 'truongvane',
      avatar: 'assets/img/hero/hero-1.jpg',
      bio: 'Personal trainer',
      location: 'Cần Thơ',
      joinDate: 'Tháng 5, 2025',
      friendCount: 178,
      postCount: 134,
      isOnline: true,
      isFriend: false
    },
    {
      id: '6',
      name: 'Hồ Thị F',
      username: 'hothif',
      avatar: 'assets/img/hero/hero-2.jpg',
      bio: 'Cardio instructor',
      location: 'Bình Dương',
      joinDate: 'Tháng 6, 2025',
      friendCount: 92,
      postCount: 67,
      isOnline: false,
      isFriend: false
    }
  ];

  constructor() {}

  /**
   * Lấy tất cả bạn bè
   */
  getAllFriends(): Observable<Friend[]> {
    return of(this.mockFriends).pipe(
      delay(500) // Simulate API call
    );
  }

  /**
   * Tìm kiếm bạn bè
   */
  searchFriends(query: string): Observable<Friend[]> {
    const lowerQuery = query.toLowerCase();
    const filtered = this.mockFriends.filter(friend =>
      friend.name.toLowerCase().includes(lowerQuery) ||
      friend.username.toLowerCase().includes(lowerQuery)
    );
    return of(filtered).pipe(delay(300));
  }

  /**
   * Lấy thông tin chi tiết của bạn
   */
  getFriendProfile(friendId: string): Observable<FriendProfile> {
    const friend = this.mockFriends.find(f => f.id === friendId);
    if (friend) {
      const profile: FriendProfile = {
        ...friend,
        email: 'example@email.com',
        phone: '+84 123 456 789',
        website: 'https://example.com',
        followers: 450,
        following: 230
      };
      return of(profile).pipe(delay(300));
    }
    return of({} as FriendProfile);
  }

  /**
   * Lấy bạn chung
   */
  getMutualFriends(friendId: string): Observable<Friend[]> {
    // Return mock mutual friends
    const mutualFriends = this.mockFriends.filter(
      f => f.id !== friendId && Math.random() > 0.5
    ).slice(0, 3);
    return of(mutualFriends).pipe(delay(300));
  }

  /**
   * Kết bạn
   */
  addFriend(friendId: string): Observable<any> {
    const friend = this.mockFriends.find(f => f.id === friendId);
    if (friend) {
      friend.isFriend = true;
    }
    return of({ success: true, message: 'Đã gửi lời mời kết bạn' }).pipe(
      delay(500)
    );
  }

  /**
   * Hủy kết bạn
   */
  removeFriend(friendId: string): Observable<any> {
    const friend = this.mockFriends.find(f => f.id === friendId);
    if (friend) {
      friend.isFriend = false;
    }
    return of({ success: true, message: 'Đã hủy kết bạn' }).pipe(
      delay(500)
    );
  }

  /**
   * Gửi tin nhắn
   */
  sendMessage(friendId: string, message: string): Observable<any> {
    return of({ success: true, message: 'Tin nhắn đã được gửi' }).pipe(
      delay(500)
    );
  }
}

