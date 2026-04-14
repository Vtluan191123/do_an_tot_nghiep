import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserManagementService } from '../../service/user/user-management.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface User {
  id?: number;
  username: string;
  email: string;
  fullName: string;
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

  formData: User = {
    username: '',
    email: '',
    fullName: '',
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
      page: 0,
      size: 100,
      sortBy: 'id',
      sortDirection: 'DESC'
    };

    this.userService.getAllUsers(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.users = response.data;
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
}

