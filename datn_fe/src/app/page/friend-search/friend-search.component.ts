import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NavComponent } from '../share/nav/nav.component';
import { FooterComponent } from '../share/footer/footer.component';
import { FriendSearchService, Friend } from '../../service/friend/friend-search.service';
import { FriendProfileModalComponent } from './friend-profile-modal/friend-profile-modal.component';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

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
export class FriendSearchComponent implements OnInit, OnDestroy {
  searchQuery: string = '';
  friends: Friend[] = [];
  filteredFriends: Friend[] = [];
  isLoading = false;
  selectedFriend: Friend | null = null;
  showProfileModal = false;

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;
  pageSizeOptions: number[] = [6, 10, 15, 20, 30];
  totalItems: number = 0;
  totalPages: number = 0;
  paginatedFriends: Friend[] = [];

  // Search debounce
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private friendService: FriendSearchService,
    private modalService: NgbModal,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Make friendService accessible in template
  get friendServiceAccess(): FriendSearchService {
    return this.friendService;
  }

  ngOnInit(): void {
    // Setup search debouncing (300ms delay)
    this.searchSubject.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe((query) => {
      this.performSearch(query);
    });

    this.loadAllFriends();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Paginate filtered friends
  updatePagination(): void {
    this.totalItems = this.filteredFriends.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);

    // Reset to page 1 if current page exceeds total pages
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }

    this.applyPagination();
  }

  applyPagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedFriends = this.filteredFriends.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyPagination();
    }
  }

  changePageSize(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1;
    // Call search API directly when page size changes
    debugger
    this.performSearch(this.searchQuery);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  loadAllFriends(): void {
    this.isLoading = true;
    this.friendService.getAllFriends().subscribe(
      (friends) => {
        this.friends = friends;
        this.filteredFriends = friends;
        this.currentPage = 1;
        this.updatePagination();
        this.isLoading = false;
      },
      (error) => {
        console.error('Lỗi tải danh sách bạn bè:', error);
        this.isLoading = false;
      }
    );
  }

  performSearch(query: string): void {
    // Reset to page 1 when searching
    this.currentPage = 1;

    // If search query is empty, load all friends
    if (!query.trim()) {
      this.filteredFriends = this.friends;
      this.updatePagination();
      return;
    }

    this.isLoading = true;
    this.friendService.searchFriends(query).subscribe(
      (friends) => {
        this.filteredFriends = friends;
        this.updatePagination();
        this.isLoading = false;
      },
      (error) => {
        console.error('Lỗi tìm kiếm bạn bè:', error);
        this.isLoading = false;
      }
    );
  }

  onSearchEnter(): void {
    // Trigger the search subject with current query
    this.searchSubject.next(this.searchQuery);
  }

  onSearchInput(query: string): void {
    this.searchQuery = query;
    // Trigger the search subject with debounce
    this.searchSubject.next(query);
  }

  onClearSearch(): void {
    this.searchQuery = '';
    this.filteredFriends = this.friends;
    this.currentPage = 1;
    this.updatePagination();
  }

  onFriendClick(friend: Friend): void {
    // Ensure we're working with a copy to avoid reference issues
    const selectedFriendCopy = { ...friend };
    this.selectedFriend = selectedFriendCopy;
    this.showProfileModal = true;

    // Lấy thông tin chi tiết
    this.friendService.getFriendProfile(friend.id).subscribe(
      (profile) => {
        // Double-check that the modal is still showing the same friend
        if (this.selectedFriend && this.selectedFriend.id === selectedFriendCopy.id) {
          // Merge profile with existing data
          const updatedFriend = { ...this.selectedFriend, ...profile };
          // Ensure avatar is set correctly
          if (!updatedFriend.avatar) {
            updatedFriend.avatar = this.friendService.getAvatar(updatedFriend.username);
          }
          this.selectedFriend = updatedFriend;
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
        // Update friend in paginated list
        const friend = this.paginatedFriends.find(f => f.id === friendId);
        if (friend) {
          friend.isFriend = true;
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



