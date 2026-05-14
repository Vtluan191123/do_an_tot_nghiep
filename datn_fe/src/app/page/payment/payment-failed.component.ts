import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../share/nav/nav.component';
import { FooterComponent } from '../share/footer/footer.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-payment-failed',
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
              <h2>Thanh toán thất bại</h2>
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
          <div class="failed-card">
            <!-- Failed Icon -->
            <div class="icon-container">
              <i class="bi bi-x-circle"></i>
            </div>

            <!-- Failed Message -->
            <h1 class="title">Thanh toán thất bại!</h1>
            <p class="subtitle">Giao dịch của bạn không thể hoàn tất</p>

            <!-- Error Details -->
            <div class="details-box">
              <div class="detail-row" *ngIf="orderId">
                <span class="label">Mã đơn hàng:</span>
                <span class="value">{{ orderId }}</span>
              </div>
              <div class="detail-row" *ngIf="errorMessage">
                <span class="label">Lý do:</span>
                <span class="value error-text">{{ errorMessage }}</span>
              </div>
            </div>

            <!-- Message -->
            <p class="message">
              Thanh toán của bạn không thành công. Vui lòng kiểm tra lại thông tin thẻ hoặc tài khoản ngân hàng của bạn.
              <br><strong>Nếu bạn tiếp tục gặp sự cố, vui lòng liên hệ bộ phận hỗ trợ khách hàng.</strong>
            </p>

            <!-- Action Buttons -->
            <div class="button-group">
              <button class="btn btn-danger btn-lg" (click)="retryPayment()">
                <i class="bi bi-arrow-clockwise me-2"></i>Thử lại
              </button>
              <button class="btn btn-outline-secondary btn-lg" (click)="goToHome()">
                <i class="bi bi-house me-2"></i>Về trang chủ
              </button>
            </div>

            <!-- Support Contact -->
            <div class="support-section">
              <p class="support-text">
                <i class="bi bi-info-circle me-2"></i>
                Cần trợ giúp? <a href="mailto:support@example.com">Liên hệ hỗ trợ</a>
              </p>
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

    .failed-card {
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
      color: #dc3545;
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
      background: #fff5f5;
      border-left: 4px solid #dc3545;
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 30px;
      text-align: left;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #ffe0e0;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 600;
      color: #555;
    }

    .value {
      color: #dc3545;
      font-family: monospace;
      font-weight: 500;
    }

    .error-text {
      color: #721c24;
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
      margin-bottom: 30px;
    }

    .btn-lg {
      padding: 12px 30px;
      font-size: 16px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .btn-danger {
      background-color: #dc3545;
      border-color: #dc3545;
    }

    .btn-danger:hover {
      background-color: #c82333;
      border-color: #bd2130;
    }

    .btn-outline-secondary {
      color: #6c757d;
      border-color: #6c757d;
    }

    .btn-outline-secondary:hover {
      background-color: #6c757d;
      color: white;
    }

    .support-section {
      padding-top: 20px;
      border-top: 1px solid #dee2e6;
    }

    .support-text {
      color: #666;
      font-size: 14px;
      margin: 0;
    }

    .support-text a {
      color: #007bff;
      text-decoration: none;
      font-weight: 600;
    }

    .support-text a:hover {
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .failed-card {
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
export class PaymentFailedComponent implements OnInit, OnDestroy {
  orderId: string | null = null;
  errorMessage: string | null = null;

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
        this.errorMessage = params['message'] || 'Thanh toán không thành công';
      });
  }

  retryPayment(): void {
    // Navigate back to payment page to retry
    this.router.navigate(['/payment']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

