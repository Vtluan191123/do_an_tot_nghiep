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
  isSubmitting = false;  // Flag để ngăn spam

  constructor(private friendService: FriendSearchService,
              private toastService: ToastrService) {}

  ngOnInit(): void {
    console.log(this.friend)
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
    if (this.isSubmitting) return;  // Ngăn spam
    this.isSubmitting = true;

    this.friendService.addFriend(this.friend.id).subscribe(
      (_response: any) => {
        // Emit event để component cha cập nhật list
        this.addFriend.emit(this.friend.id);
        // Cập nhật statusFriend = 0 (pending)
        this.friend.statusFriend = 0;
        // Refetch profile để lấy sentByMe từ API (persistent)
        this.friendService.getFriendProfile(this.friend.id).subscribe(
          (profile: any) => {
            if (profile && profile.sentByMe !== undefined) {
              this.friend.sentByMe = profile.sentByMe;
            }
            this.isSubmitting = false;
          },
          () => {
            // If refetch fails, just set sentByMe = true (I sent it)
            this.friend.sentByMe = true;
            this.isSubmitting = false;
          }
        );
        this.toastService.success('Đã gửi lời mời kết bạn', 'Thành công');
      },
      (error: any) => {
        console.error('Lỗi khi kết bạn:', error);
        this.toastService.error('Lỗi khi gửi lời mời', 'Lỗi');
        this.isSubmitting = false;
      }
    );
  }

  /**
   * Chấp nhận lời mời kết bạn
   */
  onAcceptFriend(): void {
    if (this.isSubmitting) return;  // Ngăn spam
    this.isSubmitting = true;

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
        this.isSubmitting = false;
      },
      (error) => {
        console.error('Lỗi chấp nhận lời mời:', error);
        this.toastService.error('Lỗi chấp nhận lời mời', 'Lỗi');
        this.isSubmitting = false;
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

