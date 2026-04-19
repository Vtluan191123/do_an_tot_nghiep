import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavComponent } from '../share/nav/nav.component';
import { FooterComponent } from '../share/footer/footer.component';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface EnrollmentData {
  subjectId?: number;
  subjectName?: string;
  comboId?: number;
  comboName?: string;
  sessions?: number;
  quantity?: number;
  price: number;
  totalAmount: number;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent, FooterComponent],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit, OnDestroy {

  enrollmentData: EnrollmentData | null = null;
  loading: boolean = false;

  formData = {
    fullName: '',
    email: '',
    phone: ''
  };

  private destroy$ = new Subject<void>();
  private apiUrl = `${environment.apiUrl}/api/payment`;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadEnrollmentData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load enrollment data from localStorage
   */
  loadEnrollmentData(): void {
    const data = localStorage.getItem('enrollmentData');
    if (data) {
      this.enrollmentData = JSON.parse(data);
      console.log('Enrollment data:', this.enrollmentData);
    } else {
      // Redirect to dashboard if no enrollment data
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Submit payment to VNPay
   */
  submitPayment(): void {
    if (!this.validateForm()) {
      return;
    }

    if (!this.enrollmentData) {
      alert('Lỗi: Không tìm thấy thông tin đăng ký');
      return;
    }
    this.loading = true;

    // Determine if it's subject or combo payment
    const isCombo = !!this.enrollmentData.comboId;
    const endpoint = isCombo ? '/vnpay-submit-order-combo' : '/vnpay-submit-order';

    const params: any = {
      fullName: this.formData.fullName,
      email: this.formData.email,
      phone: this.formData.phone,
      amount: this.enrollmentData.totalAmount
    };

    if (isCombo) {
      params.comboId = this.enrollmentData.comboId;
      params.quantity = this.enrollmentData.quantity;
    } else {
      params.subjectId = this.enrollmentData.subjectId;
      params.sessions = this.enrollmentData.sessions;
    }

    this.http.post<any>(`${this.apiUrl}${endpoint}`, null, { params })
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response: any) => {
          console.log('Payment URL response:', response);
          if (response.status === 200 && response.data) {
            // Redirect to VNPay
            window.location.href = response.data;
          } else {
            alert('Lỗi: Không thể tạo URL thanh toán');
            this.loading = false;
          }
        },
        (error: any) => {
          console.error('Error creating payment:', error);
          alert('Lỗi khi tạo URL thanh toán: ' + error?.error?.message);
          this.loading = false;
        }
      );
  }

  /**
   * Validate form
   */
  validateForm(): boolean {
    if (!this.formData.fullName.trim()) {
      alert('Vui lòng nhập tên đầy đủ');
      return false;
    }

    if (!this.formData.email.trim()) {
      alert('Vui lòng nhập email');
      return false;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) {
      alert('Email không hợp lệ');
      return false;
    }

    if (!this.formData.phone.trim()) {
      alert('Vui lòng nhập số điện thoại');
      return false;
    }

    return true;
  }

  /**
   * Go back to detail page (subject or combo)
   */
  goBack(): void {
    if (this.enrollmentData) {
      if (this.enrollmentData.comboId) {
        this.router.navigate(['/combo-detail', this.enrollmentData.comboId]);
      } else if (this.enrollmentData.subjectId) {
        this.router.navigate(['/subject-detail', this.enrollmentData.subjectId]);
      } else {
        this.router.navigate(['/dashboard']);
      }
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Format price
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }
}

