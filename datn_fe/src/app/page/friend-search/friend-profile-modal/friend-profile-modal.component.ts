import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Friend, FriendProfile } from '../../../service/friend/friend-search.service';
import { FriendSearchService } from '../../../service/friend/friend-search.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-friend-profile-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './friend-profile-modal.component.html',
  styleUrls: ['./friend-profile-modal.component.scss']
})
export class FriendProfileModalComponent implements OnInit {
  @Input() friend!: Friend;
  @Output() close = new EventEmitter<void>();
  @Output() addFriend = new EventEmitter<string>();
  @Output() message = new EventEmitter<string>();

  mutualFriends: Friend[] = [];
  profile: FriendProfile | null = null;
  isLoading = false;

  constructor(private friendService: FriendSearchService,
              private toastService: ToastrService) {}

  ngOnInit(): void {
    this.loadMutualFriends();
  }

  loadMutualFriends(): void {
    this.isLoading = true;
    this.friendService.getMutualFriends(this.friend.id).subscribe(
      (friends) => {
        this.mutualFriends = friends;
        this.isLoading = false;
      },
      (error) => {
        console.error('Lỗi tải bạn chung:', error);
        this.isLoading = false;
      }
    );
  }

  onClose(): void {
    this.close.emit();
  }

  onAddFriend(): void {
    this.addFriend.emit(this.friend.id);
  }

  /**
   * Chấp nhận lời mời kết bạn
   */
  onAcceptFriend(): void {
    this.friendService.acceptFriendRequest(this.friend.id).subscribe(
      (response: any) => {
        // Cập nhật lại statusFriend = 1 (accepted)
        if (this.friend) {
          this.friend.statusFriend = 1;
          this.friend.sentByMe = false;  // They sent it to me, I accepted
        }
        this.toastService.success(
          `Bạn đã chấp nhận lời mời kết bạn từ ${this.friend.username}`,
          'Thành công'
        );
      },
      (error) => {
        console.error('Lỗi chấp nhận lời mời:', error);
        this.toastService.error('Lỗi chấp nhận lời mời', 'Lỗi');
      }
    );
  }

  /**
   * Xử lý nhắn tin - check statusFriend trước
   * statusFriend: null = không phải bạn bè
   * statusFriend: 0 = chờ chấp nhận
   * statusFriend: 1 = đã là bạn bè
   */
  onMessage(): void {
    // Convert to number in case it's a string from API
    const status = typeof this.friend.statusFriend === 'string'
      ? parseInt(this.friend.statusFriend, 10)
      : this.friend.statusFriend;

    // Nếu chưa là bạn bè hoặc chờ chấp nhận, show cảnh báo
    if (status !== 1) {
      this.toastService.warning(
        `Bạn phải là bạn bè của ${this.friend.username} để có thể nhắn tin`,
        'Không thể nhắn tin'
      );
      return;
    }

    // Nếu đã là bạn bè, emit event để hiển thị message
    this.message.emit(this.friend.id);
  }

  /**
   * Get avatar URL if image is not available
   */
  getAvatarUrl(friend: Friend): string {
    if (friend.avatar && !friend.avatar.includes('ui-avatars.com')) {
      return friend.avatar;
    }
    return this.friendService.getAvatar(friend.username);
  }
}

