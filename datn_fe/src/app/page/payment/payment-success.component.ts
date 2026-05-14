import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../share/nav/nav.component';
import { FooterComponent } from '../share/footer/footer.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, NavComponent, FooterComponent],
  template: `
    <app-nav></app-nav>

    <!-- Breadcrumb Section Begin -->
    <section class="breadcrumb-section set-bg" [ngStyle]="{'background-image': 'url(assets/img/breadcrumb-bg.jpg)'}">
      <div class="container">
        <div class="row">
          <div class="col-lg-12 text-center">
            <div class="breadcrumb-text">
              <h2>Thanh toán thành công</h2>
              <div class="bt-option">
                <a href="/">Trang chủ</a>
                <span>Kết quả thanh toán</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- Breadcrumb Section End -->

    <div class="container my-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="success-card">
            <!-- Success Icon -->
            <div class="icon-container">
              <i class="bi bi-check-circle"></i>
            </div>

            <!-- Success Message -->
            <h1 class="title">Thanh toán thành công!</h1>
            <p class="subtitle">Giao dịch của bạn đã được xử lý thành công</p>

            <!-- Transaction Details -->
            <div class="details-box" *ngIf="orderId || transactionId">
              <div class="detail-row" *ngIf="orderId">
                <span class="label">Mã đơn hàng:</span>
                <span class="value">{{ orderId }}</span>
              </div>
              <div class="detail-row" *ngIf="transactionId">
                <span class="label">Mã giao dịch:</span>
                <span class="value">{{ transactionId }}</span>
              </div>
            </div>

            <!-- Message -->
            <p class="message">
              Cảm ơn bạn đã tin tưởng chúng tôi. Khóa học/gói hàng của bạn đã được kích hoạt.
              Vui lòng kiểm tra email để nhận thông tin chi tiết.
            </p>

            <!-- Action Buttons -->
            <div class="button-group">
              <button class="btn btn-success btn-lg" (click)="goToHome()">
                <i class="bi bi-house me-2"></i>Về trang chủ
              </button>
              <button class="btn btn-outline-primary btn-lg" (click)="goToDashboard()">
                <i class="bi bi-speedometer2 me-2"></i>Xem khóa học của tôi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-footer></app-footer>
  `,
  styles: [`
    .breadcrumb-section {
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      padding: 60px 0;
      background-color: #f8f9fa;
      margin-top: 80px;
    }

    .breadcrumb-text {
      text-align: center;
    }

    .breadcrumb-text h2 {
      font-size: 36px;
      color: #333;
      margin-bottom: 20px;
      font-weight: 600;
    }

    .bt-option {
      display: flex;
      justify-content: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .bt-option a,
    .bt-option span {
      color: #666;
      font-size: 16px;
      text-decoration: none;
    }

    .bt-option a:hover {
      color: #007bff;
    }

    .bt-option span {
      color: #007bff;
      font-weight: 600;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 15px;
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      margin-right: -15px;
      margin-left: -15px;
    }

    .col-lg-12 {
      flex: 0 0 100%;
      max-width: 100%;
      padding-right: 15px;
      padding-left: 15px;
    }

    .my-5 {
      margin-top: 3rem !important;
      margin-bottom: 3rem !important;
    }

    .success-card {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .icon-container {
      margin-bottom: 30px;
    }

    .icon-container i {
      font-size: 64px;
      color: #28a745;
    }

    .title {
      font-size: 32px;
      font-weight: 600;
      color: #333;
      margin-bottom: 10px;
    }

    .subtitle {
      font-size: 18px;
      color: #666;
      margin-bottom: 30px;
    }

    .details-box {
      background: #f8f9fa;
      border-left: 4px solid #28a745;
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 30px;
      text-align: left;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #dee2e6;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 600;
      color: #555;
    }

    .value {
      color: #28a745;
      font-family: monospace;
      font-weight: 500;
    }

    .message {
      font-size: 16px;
      color: #666;
      line-height: 1.6;
      margin-bottom: 30px;
    }

    .button-group {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn-lg {
      padding: 12px 30px;
      font-size: 16px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .btn-success {
      background-color: #28a745;
      border-color: #28a745;
    }

    .btn-success:hover {
      background-color: #218838;
      border-color: #1e7e34;
    }

    .btn-outline-primary {
      color: #007bff;
      border-color: #007bff;
    }

    .btn-outline-primary:hover {
      background-color: #007bff;
      color: white;
    }

    @media (max-width: 768px) {
      .success-card {
        padding: 25px;
      }

      .title {
        font-size: 24px;
      }

      .subtitle {
        font-size: 16px;
      }

      .button-group {
        flex-direction: column;
      }

      .btn-lg {
        width: 100%;
      }
    }
  `]
})
export class PaymentSuccessComponent implements OnInit, OnDestroy {
  orderId: string | null = null;
  transactionId: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.orderId = params['orderId'] || null;
        this.transactionId = params['transactionId'] || null;
      });
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  goToDashboard(): void {
    this.router.navigate(['/student-enrolled-subjects']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

