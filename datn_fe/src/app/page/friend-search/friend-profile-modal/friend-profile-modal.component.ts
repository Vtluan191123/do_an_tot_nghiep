import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Friend, FriendProfile } from '../../../service/friend/friend-search.service';
import { FriendSearchService } from '../../../service/friend/friend-search.service';

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

  constructor(private friendService: FriendSearchService) {}

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

  onMessage(): void {
    this.message.emit(this.friend.id);
  }
}

