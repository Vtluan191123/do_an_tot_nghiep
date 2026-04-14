import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NavComponent } from '../share/nav/nav.component';
import { FooterComponent } from '../share/footer/footer.component';
import { FriendSearchService, Friend } from '../../service/friend/friend-search.service';
import { FriendProfileModalComponent } from './friend-profile-modal/friend-profile-modal.component';
import { AuthService } from '../../service/auth/auth.service';
import { TransferDataService } from '../../service/tranfer-data/transfer-data.service';
import { UserService } from '../../service/user/user.service';
import {ToastrService} from 'ngx-toastr';

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

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;
  pageSizeOptions: number[] = [6, 10, 15, 20, 30];
  totalItems: number = 0;
  totalPages: number = 0;
  paginatedFriends: Friend[] = [];

  constructor(
    private friendService: FriendSearchService,
    private modalService: NgbModal,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private transferDataService: TransferDataService,
    private toastService: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Make friendService accessible in template
  get friendServiceAccess(): FriendSearchService {
    return this.friendService;
  }

  ngOnInit(): void {
    this.loadAllFriends();
  }


  // Paginate filtered friends
  updatePagination(): void {
    // If no items, set totalPages to 0 (don't show pagination)
    if (this.totalItems === 0) {
      this.totalPages = 0;
      this.paginatedFriends = [];
      return;
    }

    // Calculate total pages: ceil(totalItems / pageSize)
    // Example: 25 items, size 10 → ceil(25/10) = ceil(2.5) = 3 pages ✓
    // Example: 20 items, size 10 → ceil(20/10) = ceil(2) = 2 pages ✓
    // Example: 21 items, size 10 → ceil(21/10) = ceil(2.1) = 3 pages ✓
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);

    // Validate current page
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }

    // Since API already returns paginated data, use it directly
    this.paginatedFriends = this.filteredFriends;
  }

  applyPagination(): void {
    // No longer needed - API handles pagination
    // Keeping for backward compatibility
    this.paginatedFriends = this.filteredFriends;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      // Call API directly when changing page
      this.performSearch(this.searchQuery);
    }
  }

  changePageSize(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1;
    // Call API directly when page size changes
    this.performSearch(this.searchQuery);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage = this.currentPage + 1;
      // Call API directly when going to next page
      this.performSearch(this.searchQuery);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage = this.currentPage - 1;
      // Call API directly when going to previous page
      this.performSearch(this.searchQuery);
    }
  }

  getPageNumbers(): number[] {
    // Guard: if totalPages is 0 or 1, don't show pagination
    if (this.totalPages <= 1) {
      return [];
    }

    const pages: number[] = [];

    // Limit pages to show (e.g., show max 5 pages at a time)
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    // Adjust startPage if endPage is at the end
    if (endPage === this.totalPages) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  loadAllFriends(): void {
    this.isLoading = true;
    // Load friends with pagination parameters
    this.friendService.getAllFriends(this.currentPage, this.pageSize).subscribe(
      (result) => {
        this.friends = result.data;
        this.filteredFriends = result.data;
        this.totalItems = result.count;  // Get total from API response
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
    // Reset to page 1 when searching with new query
    if (this.searchQuery !== query) {
      this.currentPage = 1;
    }

    // If search query is empty, load all friends with pagination
    if (!query.trim()) {
      this.isLoading = true;
      // Call API with pagination parameters
      this.friendService.getAllFriends(this.currentPage, this.pageSize).subscribe(
        (result) => {
          this.filteredFriends = result.data;
          this.totalItems = result.count;  // Get total from API response
          this.updatePagination();
          this.isLoading = false;
        },
        (error) => {
          console.error('Lỗi tải danh sách bạn bè:', error);
          this.isLoading = false;
        }
      );
      return;
    }

    this.isLoading = true;
    // Call API with search query and pagination parameters
    this.friendService.searchFriends(query, this.currentPage, this.pageSize).subscribe(
      (result) => {
        this.filteredFriends = result.data;
        this.totalItems = result.count;  // Get total from API response
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
    // Call API directly
    this.performSearch(this.searchQuery);
  }

  onSearchInput(query: string): void {
    this.searchQuery = query;
    // Call API directly (no debounce)
    this.performSearch(query);
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
    // Update friend in paginated list - API call is already done in modal component
    const friend = this.paginatedFriends.find(f => f.id === friendId);
    if (friend) {
      friend.statusFriend = 0;
      friend.sentByMe = true;  // I sent this request
    }
  }

  onMessage(friendId: string): void {
    // Get current user ID
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.toastService.error('Không thể lấy thông tin user hiện tại', 'Lỗi');
      return;
    }

    // Fetch list of groups for current user and find the one with this friend
    this.userService.getListGroup(currentUser.id).subscribe(
      (response: any) => {
        if (response && response.data && response.data.userDetailGroudDto) {
          // Find the group with this friend
          const friendGroup = response.data.userDetailGroudDto.find(
            (group: any) => group.id.toString() === friendId.toString()
          );

          if (friendGroup && friendGroup.groudId) {
            console.log('Found groudId:', friendGroup.groudId);

            // Emit event + FULL groud data to app.component via TransferDataService
            // Send entire friendGroup object with all fields (id, username, email, groudId, etc)
            this.transferDataService.sendMessage(friendGroup);
            console.log('Sending friend group data:', friendGroup);

            this.closeProfileModal();
          } else {
            this.toastService.error('Không tìm thấy cuộc trò chuyện với bạn này', 'Lỗi');
          }
        }
      },
      (error) => {
        console.error('Error fetching groups:', error);
        this.toastService.error('Lỗi khi tải danh sách cuộc trò chuyện', 'Lỗi');
      }
    );
  }
}



