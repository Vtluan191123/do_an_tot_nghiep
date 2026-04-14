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

  // Pagination properties
  currentPage: number = 0;
  pageSize: number = 10;
  pageSizeOptions: number[] = [5, 10, 15, 20, 50];
  totalUsers: number = 0;
  totalPages: number = 0;

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
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.isLoading = true;
    const filter = {
      page: this.currentPage,
      size: this.pageSize,
      sortBy: 'id',
      sortDirection: 'DESC'
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
          console.error('Error loading users:', error);
          this.toastr.error('Lỗi tải danh sách user');
          this.isLoading = false;
        }
      });
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

    // Create preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.formData.image = e.target.result; // Set as base64 for preview
    };
    reader.readAsDataURL(file);

    // Upload file
    this.uploadImage(file);
  }

  /**
   * Upload image to server
   */
  private uploadImage(file: File): void {
    this.isUploadingImage = true;
    const formData = new FormData();
    formData.append('file', file);

    this.userService.uploadImage(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isUploadingImage = false;
          // Assuming backend returns URL or path
          const imagePath = response.data || response;
          this.formData.image = imagePath;
          this.toastr.success('Upload ảnh thành công');
        },
        error: (error) => {
          this.isUploadingImage = false;
          console.error('Error uploading image:', error);
          this.toastr.error('Lỗi upload ảnh');
        }
      });
  }

  /**
   * Clear image selection
   */
  clearImage(): void {
    this.formData.image = '';
    this.toastr.info('Đã xóa ảnh');
  }

  protected readonly BASE_URL_UPLOAD = BASE_URL_UPLOAD;
}

