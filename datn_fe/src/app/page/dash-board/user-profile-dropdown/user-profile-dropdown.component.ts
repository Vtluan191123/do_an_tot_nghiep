import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth/auth.service';

@Component({
  selector: 'app-user-profile-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="user-profile-dropdown" #dropdownContainer>
      <!-- Not Logged In: Show Login/Register Buttons -->
      <div class="auth-buttons" *ngIf="!isLoggedIn">
        <button class="btn-login" (click)="goToLogin()" title="Đăng nhập">
          <i class="fas fa-sign-in-alt"></i>
          Đăng Nhập
        </button>
        <button class="btn-register" (click)="goToRegister()" title="Đăng ký">
          <i class="fas fa-user-plus"></i>
          Đăng Ký
        </button>
      </div>

      <!-- User Avatar/Button -->
      <button class="user-btn" (click)="toggleDropdown()" *ngIf="currentUser">
        <img [src]="getAvatar()" [alt]="currentUser.username" class="user-avatar">
        <span class="user-name">{{ currentUser.username }}</span>
        <i class="fas fa-chevron-down"></i>
      </button>

      <!-- Dropdown Menu -->
      <div class="dropdown-menu" *ngIf="isDropdownOpen" (click)="$event.stopPropagation()">
        <!-- User Info -->
        <div class="dropdown-header">
          <img [src]="getAvatar()" [alt]="currentUser.username" class="dropdown-avatar">
          <div class="user-info">
            <h4>{{ currentUser.username }}</h4>
            <p>{{ currentUser.email }}</p>
          </div>
        </div>

        <hr>

        <!-- Menu Items -->
        <a class="dropdown-item" (click)="viewProfile()">
          <i class="fas fa-user"></i>
          <span>View Profile</span>
        </a>

        <a class="dropdown-item" (click)="editProfile()">
          <i class="fas fa-edit"></i>
          <span>Edit Profile</span>
        </a>

        <a class="dropdown-item" (click)="changePassword()">
          <i class="fas fa-lock"></i>
          <span>Change Password</span>
        </a>

        <hr>

        <a class="dropdown-item logout-item" (click)="onLogout()">
          <i class="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </a>
      </div>

      <!-- View Profile Modal -->
      <div class="modal-overlay" *ngIf="showProfileModal" (click)="closeProfileModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>User Profile</h3>
            <button class="close-btn" (click)="closeProfileModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="profile-info">
              <img [src]="getAvatar()" [alt]="currentUser.username" class="profile-avatar">
              <div class="info-group">
                <label>Username:</label>
                <p>{{ currentUser.username }}</p>
              </div>
              <div class="info-group">
                <label>Email:</label>
                <p>{{ currentUser.email }}</p>
              </div>
              <div class="info-group">
                <label>User ID:</label>
                <p>{{ currentUser.id }}</p>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeProfileModal()">Close</button>
            <button class="btn btn-primary" (click)="closeProfileModal(); editProfile()">Edit</button>
          </div>
        </div>
      </div>

      <!-- Edit Profile Modal -->
      <div class="modal-overlay" *ngIf="showEditModal" (click)="closeEditModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Edit Profile</h3>
            <button class="close-btn" (click)="closeEditModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form (ngSubmit)="submitEditProfile()">
            <div class="modal-body">
              <div class="form-group">
                <label>Username</label>
                <input type="text" class="form-control" [(ngModel)]="editFormData.username" name="username">
              </div>

              <div class="form-group">
                <label>Email</label>
                <input type="email" class="form-control" [(ngModel)]="editFormData.email" name="email">
              </div>

              <div *ngIf="editMessage" class="alert" [ngClass]="editMessageType">
                {{ editMessage }}
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeEditModal()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="isEditLoading">
                <span *ngIf="!isEditLoading">Save Changes</span>
                <span *ngIf="isEditLoading"><i class="fas fa-spinner fa-spin"></i> Saving...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-profile-dropdown {
      position: relative;
      display: inline-block;
      z-index: 100;
    }

    .user-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #f8f9fa;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 8px 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 14px;
      color: #333;
    }

    .user-btn:hover {
      background: #e9ecef;
      border-color: #667eea;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-name {
      font-weight: 600;
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      min-width: 280px;
      width: auto;
      z-index: 1001;
      margin-top: 8px;
      animation: slideDown 0.3s ease;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .dropdown-header {
      padding: 16px;
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .dropdown-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-info h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .user-info p {
      margin: 4px 0 0 0;
      font-size: 12px;
      color: #666;
    }

    .dropdown-menu hr {
      margin: 8px 0;
      border: none;
      border-top: 1px solid #eee;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: #333;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s ease;
      background: none;
      border: none;
      width: 100%;
      text-align: left;
    }

    .dropdown-item:hover {
      background: #f8f9fa;
      color: #667eea;
      padding-left: 20px;
    }

    .dropdown-item i {
      width: 20px;
      text-align: center;
    }

    .dropdown-item.logout-item {
      color: #dc3545;
    }

    .dropdown-item.logout-item:hover {
      background: #fff5f5;
      color: #dc3545;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      animation: modalSlideIn 0.3s ease;
    }

    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #eee;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 20px;
      color: #333;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
      transition: color 0.3s ease;
    }

    .close-btn:hover {
      color: #333;
    }

    .modal-body {
      padding: 20px;
    }

    .profile-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    .profile-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #667eea;
    }

    .info-group {
      width: 100%;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .info-group label {
      font-weight: 600;
      color: #333;
      display: block;
      margin-bottom: 4px;
    }

    .info-group p {
      margin: 0;
      color: #666;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #333;
    }

    .form-control {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.3s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .alert {
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 16px;
      font-size: 14px;
    }

    .alert.alert-success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .alert.alert-error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .modal-footer {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      padding: 20px;
      border-top: 1px solid #eee;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      font-size: 14px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #e9ecef;
      color: #333;
    }

    .btn-secondary:hover {
      background: #dee2e6;
    }

    /* Auth Buttons Styles */
    .auth-buttons {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .btn-login, .btn-register {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
      white-space: nowrap;
    }

    .btn-login {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-login:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
    }

    .btn-register {
      background: white;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .btn-register:hover {
      background: #f0f4ff;
      transform: translateY(-2px);
    }

    .btn-login i, .btn-register i {
      font-size: 16px;
    }

    @media (max-width: 768px) {
      .auth-buttons {
        gap: 8px;
      }

      .btn-login, .btn-register {
        padding: 8px 12px;
        font-size: 12px;
      }
    }
  `]
})
export class UserProfileDropdownComponent implements OnInit, OnDestroy {
  isDropdownOpen = false;
  currentUser: any = null;
  isLoggedIn = false;

  showProfileModal = false;
  showEditModal = false;
  isEditLoading = false;
  editMessage = '';
  editMessageType = '';

  editFormData = {
    username: '',
    email: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isLoggedIn = isAuth;
    });

    // Subscribe to current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.editFormData = {
          username: user.username || '',
          email: user.email || ''
        };
      }
    });
  }

  ngOnDestroy(): void {
    this.isDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  getAvatar(): string {
    if (this.currentUser?.email) {
      const email = this.currentUser.email.toLowerCase().trim();
      const hash = this.simpleHash(email);
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.currentUser.username)}&background=${hash.substring(0, 6)}&color=fff`;
    }
    return 'https://ui-avatars.com/api/?name=User&background=667eea&color=fff';
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  viewProfile(): void {
    this.closeDropdown();
    this.showProfileModal = true;
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
  }

  editProfile(): void {
    this.closeDropdown();
    this.showEditModal = true;
    this.editMessage = '';
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editMessage = '';
  }

  submitEditProfile(): void {
    this.isEditLoading = true;

    this.authService.updateProfile(this.editFormData).subscribe({
      next: (response) => {
        this.isEditLoading = false;
        this.editMessage = 'Profile updated successfully!';
        this.editMessageType = 'alert-success';
        setTimeout(() => {
          this.closeEditModal();
        }, 1500);
      },
      error: (error) => {
        this.isEditLoading = false;
        this.editMessage = error?.error?.message || 'Failed to update profile';
        this.editMessageType = 'alert-error';
      }
    });
  }

  changePassword(): void {
    this.closeDropdown();
    console.log('Change password clicked');
  }

  onLogout(): void {
    this.closeDropdown();
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout failed:', error);
        this.router.navigate(['/login']);
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}

