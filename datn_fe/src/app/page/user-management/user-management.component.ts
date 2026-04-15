import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserManagementService } from '../../service/user/user-management.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {BASE_URL_UPLOAD} from '../../constants/constants';

interface User {
  id?: number;
  username: string;
  email: string;
  fullName: string;
  image?: string;
  imagesUrl?: string;
  phoneNumber?: string;
  avatar?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit, OnDestroy {
  users: User[] = [];
  isLoading = false;
  showForm = false;
  isEditing = false;
  selectedUser: User | null = null;
  isUploadingImage = false;

  // Roles list
  roles: any[] = [];

  // Pagination properties
  currentPage: number = 0;
  pageSize: number = 10;
  pageSizeOptions: number[] = [5, 10, 15, 20, 50];
  totalUsers: number = 0;
  totalPages: number = 0;

  // Search and filter properties
  searchUsername = '';
  searchEmail = '';
  searchFullName = '';
  searchStatus: boolean | string = '';
  searchRole: number | string = '';  // Changed to number for ID
  searchFromDate = '';
  searchToDate = '';

  formData: User = {
    username: '',
    email: '',
    fullName: '',
    image: '',
    phoneNumber: '',
    avatar: '',
    isActive: true
  };

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserManagementService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Format date string from yyyy-MM-dd to yyyy-MM-dd HH:mm:ss
   */
  private formatDateTimeForBackend(dateString: string, isEndDate: boolean = false): string {
    if (!dateString) return '';
    // dateString format from type="date" is yyyy-MM-dd
    // fromDate: append 00:00:00
    // toDate: append 23:59:59
    const time = isEndDate ? '23:59:59' : '00:00:00';
    return `${dateString} ${time}`;
  }

  /**
   * Load roles from backend
   */
  loadRoles(): void {
    this.userService.getAllRoles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.roles = response.data;
          } else if (Array.isArray(response)) {
            this.roles = response;
          }
        },
        error: (error) => {
          console.error('Error loading roles:', error);
          // Fallback to default roles if backend fails
          this.roles = [
            { id: 1, code: 'ROLE_ADMIN', name: 'Quản trị hệ thống' },
            { id: 2, code: 'ROLE_USER', name: 'Các quyền cơ bản của người dùng' },
            { id: 3, code: 'ROLE_COACH', name: 'Các quyền của người huấn luyện' }
          ];
        }
      });
  }

  loadUsers(): void {
    this.isLoading = true;

    // Combine search fields into keyword for backend to LIKE with OR
    let keyword = '';
    if (this.searchUsername.trim()) {
      keyword = this.searchUsername.trim();
    } else if (this.searchEmail.trim()) {
      keyword = this.searchEmail.trim();
    } else if (this.searchFullName.trim()) {
      keyword = this.searchFullName.trim();
    }

    const filter = {
      page: this.currentPage,
      size: this.pageSize,
      sortBy: 'id',
      sortDirection: 'DESC',
      keyword: keyword || undefined,
      isActive: this.searchStatus !== '' ? this.searchStatus : undefined,
      roleId: this.searchRole !== '' ? this.searchRole : undefined,
      fromDate: this.searchFromDate ? this.formatDateTimeForBackend(this.searchFromDate, false) : undefined,
      toDate: this.searchToDate ? this.formatDateTimeForBackend(this.searchToDate, true) : undefined
    };

    this.userService.getAllUsers(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.users = response.data;
            this.totalUsers = response.count || 0;
            this.totalPages = Math.ceil(this.totalUsers / this.pageSize);
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
        }
      });
  }

  // Search and filter methods
  onSearch(): void {
    this.currentPage = 0; // Reset to first page when searching
    this.loadUsers();
  }

  onReset(): void {
    this.searchUsername = '';
    this.searchEmail = '';
    this.searchFullName = '';
    this.searchStatus = '';
    this.searchRole = '';
    this.searchFromDate = '';
    this.searchToDate = '';
    this.currentPage = 0;
    this.loadUsers();
  }

  /**
   * Go to next page
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  /**
   * Go to previous page
   */
  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  /**
   * Go to first page
   */
  firstPage(): void {
    this.currentPage = 0;
    this.loadUsers();
  }

  /**
   * Go to last page
   */
  lastPage(): void {
    this.currentPage = this.totalPages - 1;
    this.loadUsers();
  }

  /**
   * Change page size and reset to first page
   */
  changePageSize(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 0;
    this.loadUsers();
  }

  /**
   * Go to specific page
   */
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  /**
   * Generate pagination numbers to display
   */
  getPaginationNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 0; i < this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show current page and surrounding pages
      let startPage = Math.max(0, this.currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(this.totalPages - 1, startPage + maxPagesToShow - 1);

      // Adjust start page if we're near the end
      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(0, endPage - maxPagesToShow + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  openForm(user?: User): void {
    this.showForm = true;
    if (user) {
      this.isEditing = true;
      this.selectedUser = user;
      this.formData = { ...user };
    } else {
      this.isEditing = false;
      this.selectedUser = null;
      this.formData = {
        username: '',
        email: '',
        fullName: '',
        phoneNumber: '',
        avatar: '',
        isActive: true
      };
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.selectedUser = null;
    this.formData = {
      username: '',
      email: '',
      fullName: '',
      phoneNumber: '',
      avatar: '',
      isActive: true
    };
  }

  saveUser(): void {
    if (!this.formData.username || !this.formData.email || !this.formData.fullName) {
      this.toastr.warning('Vui lòng điền đủ các trường bắt buộc');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) {
      this.toastr.warning('Email không hợp lệ');
      return;
    }

    if (this.isEditing && this.selectedUser?.id) {
      const updateRequest = {
        id: this.selectedUser.id,
        ...this.formData
      };
      this.userService.updateUser(updateRequest)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success('Cập nhật user thành công');
            this.closeForm();
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error updating user:', error);
            this.toastr.error('Lỗi cập nhật user');
          }
        });
    } else {
      this.userService.createUser(this.formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success('Thêm user thành công');
            this.closeForm();
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error creating user:', error);
            this.toastr.error('Lỗi thêm user');
          }
        });
    }
  }

  deleteUser(id: number): void {
    if (confirm('Bạn có chắc muốn xóa user này?')) {
      this.userService.deleteUser(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success('Xóa user thành công');
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            this.toastr.error('Lỗi xóa user');
          }
        });
    }
  }

  getStatusBadge(isActive?: boolean): string {
    return isActive ? 'badge-success' : 'badge-danger';
  }

  getStatusLabel(isActive?: boolean): string {
    return isActive ? 'Hoạt Động' : 'Vô Hiệu Hóa';
  }

  /**
   * Handle image file selection and upload
   */
  onImageSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.toastr.error('Chỉ hỗ trợ định dạng: JPG, PNG, GIF, WebP');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.toastr.error('Kích thước ảnh không vượt quá 5MB');
      return;
    }

    // Create preview immediately
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.formData.image = e.target.result; // Set as base64 for preview
      // Upload file after preview is set
      this.uploadImage(file);
    };
    reader.readAsDataURL(file);
  }

  /**
   * Format image URL - if it's a filename only, prepend BASE_URL_UPLOAD
   */
  private formatImageUrl(imageData: string): string {
    if (!imageData) return '';

    // If already a full URL (starts with http), return as is
    if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
      return imageData;
    }

    // Otherwise, prepend BASE_URL_UPLOAD
    return BASE_URL_UPLOAD + imageData;
  }

  /**
   * Upload image to server
   */
  private uploadImage(file: File): void {
    this.isUploadingImage = true;
    const formData = new FormData();
    formData.append('files', file);

    this.userService.uploadImage(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isUploadingImage = false;
          // Backend returns array of URLs, get the first one
          let imagePath = Array.isArray(response.data) ? response.data[0] : response.data;
          // Format the URL (add BASE_URL_UPLOAD if needed)
          imagePath = this.formatImageUrl(imagePath);
          this.formData.imagesUrl = imagePath;
          this.formData.image = imagePath; // Replace preview with server URL
          this.toastr.success('Upload ảnh thành công');
        },
        error: (error) => {
          this.isUploadingImage = false;
          console.error('Error uploading image:', error);
          this.toastr.error('Lỗi upload ảnh');
          // Keep the preview if upload fails
        }
      });
  }

  /**
   * Clear image selection
   */
  clearImage(): void {
    this.formData.image = '';
    this.formData.imagesUrl = '';
  }

  protected readonly BASE_URL_UPLOAD = BASE_URL_UPLOAD;
}

