import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, delay, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import {BASE_URL_UPLOAD} from '../../constants/constants';

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

export interface ApiUserResponse {
  id: number;
  username: string;
  email: string;
  description?: string;
  address?: string;
  imagesUrl?: string;
  age?: string;
  phoneNumber?: string;
  voteStar?: number;
  friend: boolean;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FriendSearchService {
  private apiUrl = '/api/user';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Map API response to Friend interface
   */
  private mapApiUserToFriend(user: ApiUserResponse): Friend {
    return {
      id: user.id.toString(),
      name: user.username, // Use username as name if description is not available
      username: user.username,
      avatar: user.imagesUrl ? BASE_URL_UPLOAD + user.imagesUrl : this.getAvatar(user.email || user.username),
      bio: user.description,
      location: user.address,
      joinDate: user.createdAt ? this.formatDate(user.createdAt) : undefined,
      isOnline: false, // Default to false, can be updated from another endpoint if needed
      isFriend: user.friend
    };
  }

  /**
   * Generate avatar URL if image is not available
   */
  getAvatar(emailOrUsername: string): string {
    if (emailOrUsername) {
      const email = emailOrUsername.toLowerCase().trim();
      const hash = this.simpleHash(email);
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(emailOrUsername)}&background=${hash.substring(0, 6)}&color=fff`;
    }
    return 'https://ui-avatars.com/api/?name=User&background=667eea&color=fff';
  }

  /**
   * Simple hash function for generating consistent colors
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Format date string to Vietnamese format
   */
  private formatDate(dateString: string): string | undefined {
    try {
      const date = new Date(dateString);
      const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
      return `${months[date.getMonth()]}, ${date.getFullYear()}`;
    } catch {
      return undefined;
    }
  }

  /**
   * Lấy tất cả bạn bè từ API
   */
  getAllFriends(): Observable<Friend[]> {
    // ✅ Create UserFilterRequest with pagination defaults
    const request = {
      page: 0,                    // Default page
      size: 10,                   // Default size
      sortBy: 'id',               // Default sort field
      sortDirection: 'desc',      // Default sort direction
      keyword: null,              // No keyword for getting all
    };

    return this.http.post<any>(`${this.apiUrl}/search`, request).pipe(
      map(response => {
        // Map API response to Friend[] interface
        if (response?.data && Array.isArray(response.data)) {
          return response.data.map((user: ApiUserResponse) => this.mapApiUserToFriend(user));
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching friends:', error);
        return of([]); // Return empty array on error
      })
    );
  }

  /**
   * Tìm kiếm bạn bè với UserFilterRequest
   */
  searchFriends(query: string): Observable<Friend[]> {
    // ✅ Tạo UserFilterRequest object với pagination defaults (FIXED)
    const filterRequest = {
      keyword: query,             // Trường tìm kiếm (backend sẽ tìm kiếm trong username, email)
      page: 0,                    // Default page
      size: 10,                   // Default size
      sortBy: 'id',               // Default sort by id
      sortDirection: 'desc',      // Default sort direction
    };

    return this.http.post<any>(`${this.apiUrl}/search`, filterRequest).pipe(
      map(response => {
        if (response?.data && Array.isArray(response.data)) {
          return response.data.map((user: ApiUserResponse) => this.mapApiUserToFriend(user));
        }
        return [];
      }),
      catchError(error => {
        console.error('Error searching friends:', error);
        return of([]);
      })
    );
  }

  /**
   * Lấy thông tin chi tiết của bạn
   */
  getFriendProfile(friendId: string): Observable<FriendProfile> {
    // ✅ Create filter request with pagination defaults
    const filterRequest = {
      id: friendId,               // Filter by user id
      page: 0,                    // Default page
      size: 1,                    // Only 1 result needed
      sortBy: 'id',               // Default sort
      sortDirection: 'desc',      // Default direction
    };

    return this.http.post<any>(`${this.apiUrl}/search`, filterRequest).pipe(
      map(response => {
        if (response?.data && response.data.length > 0) {
          const user = response.data[0];
          const friend = this.mapApiUserToFriend(user);
          return {
            ...friend,
            email: user.email,
            phone: user.phoneNumber,
            followers: 0, // Not available in current API
            following: 0  // Not available in current API
          } as FriendProfile;
        }
        return {} as FriendProfile;
      }),
      catchError(error => {
        console.error('Error fetching friend profile:', error);
        return of({} as FriendProfile);
      })
    );
  }

  /**
   * Lấy bạn chung
   */
  getMutualFriends(friendId: string): Observable<Friend[]> {
    // This endpoint doesn't exist in backend yet, returning empty for now
    return of([]);
  }

  /**
   * Kết bạn
   */
  addFriend(friendId: string): Observable<any> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      console.error('Current user not available');
      return of({ success: false, message: 'Người dùng chưa đăng nhập' });
    }

    const userAddId = currentUser.id;
    const userReceiverId = parseInt(friendId, 10);
    const params = { userAddId, userReceiverId };

    return this.http.post(`/api/friend/add`, null, { params }).pipe(
      catchError(error => {
        console.error('Error adding friend:', error);
        return of({ success: false, message: 'Lỗi khi kết bạn' });
      })
    );
  }

  /**
   * Hủy kết bạn
   */
  removeFriend(friendId: string): Observable<any> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      console.error('Current user not available');
      return of({ success: false, message: 'Người dùng chưa đăng nhập' });
    }

    const userAddId = currentUser.id;
    const userReceiverId = parseInt(friendId, 10);
    const params = { userAddId, userReceiverId, groudId: '' };

    return this.http.post(`/api/friend/cancel`, null, { params }).pipe(
      catchError(error => {
        console.error('Error removing friend:', error);
        return of({ success: false, message: 'Lỗi khi hủy kết bạn' });
      })
    );
  }

  /**
   * Gửi tin nhắn
   */
  sendMessage(friendId: string, message: string): Observable<any> {
    return of({ success: true, message: 'Tin nhắn đã được gửi' });
  }
}

