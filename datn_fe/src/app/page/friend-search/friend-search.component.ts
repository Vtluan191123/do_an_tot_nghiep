import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NavComponent } from '../share/nav/nav.component';
import { FooterComponent } from '../share/footer/footer.component';
import { FriendSearchService, Friend } from '../../service/friend/friend-search.service';
import { FriendProfileModalComponent } from './friend-profile-modal/friend-profile-modal.component';

@Component({
  selector: 'app-friend-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NavComponent,
    FooterComponent,
    FriendProfileModalComponent
  ],
  templateUrl: './friend-search.component.html',
  styleUrls: ['./friend-search.component.scss']
})
export class FriendSearchComponent implements OnInit {
  searchQuery: string = '';
  friends: Friend[] = [];
  filteredFriends: Friend[] = [];
  isLoading = false;
  selectedFriend: Friend | null = null;
  showProfileModal = false;

  constructor(
    private friendService: FriendSearchService,
    private modalService: NgbModal,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadAllFriends();
  }

  loadAllFriends(): void {
    this.isLoading = true;
    this.friendService.getAllFriends().subscribe(
      (friends) => {
        this.friends = friends;
        this.filteredFriends = friends;
        this.isLoading = false;
      },
      (error) => {
        console.error('Lỗi tải danh sách bạn bè:', error);
        this.isLoading = false;
      }
    );
  }

  onSearchChange(): void {
    if (!this.searchQuery.trim()) {
      this.filteredFriends = this.friends;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredFriends = this.friends.filter(friend =>
      friend.name.toLowerCase().includes(query) ||
      friend.username.toLowerCase().includes(query)
    );
  }

  onFriendClick(friend: Friend): void {
    this.selectedFriend = friend;
    this.showProfileModal = true;

    // Lấy thông tin chi tiết
    this.friendService.getFriendProfile(friend.id).subscribe(
      (profile) => {
        if (this.selectedFriend) {
          this.selectedFriend = { ...this.selectedFriend, ...profile };
        }
      },
      (error) => {
        console.error('Lỗi tải thông tin bạn bè:', error);
      }
    );
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
    this.selectedFriend = null;
  }

  onAddFriend(friendId: string): void {
    this.friendService.addFriend(friendId).subscribe(
      (response) => {
        alert('Đã gửi lời mời kết bạn');
        if (this.selectedFriend) {
          this.selectedFriend.isFriend = true;
        }
      },
      (error) => {
        console.error('Lỗi khi kết bạn:', error);
      }
    );
  }

  onMessage(friendId: string): void {
    alert('Chức năng nhắn tin sẽ sớm có');
  }
}



