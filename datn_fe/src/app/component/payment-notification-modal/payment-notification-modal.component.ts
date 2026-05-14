import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-notification-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header border-0">
      <h5 class="modal-title" [ngClass]="getHeaderClass()">
        <i [ngClass]="getIconClass()" class="me-2"></i>
        {{ getTitle() }}
      </h5>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <div class="alert" [ngClass]="getAlertClass()" role="alert">
        <p class="mb-2"><strong>{{ paymentData?.message }}</strong></p>
        <hr *ngIf="paymentData?.orderId || paymentData?.transactionId" class="my-2">
        <div *ngIf="paymentData?.orderId" class="small">
          <strong>Mã đơn hàng:</strong> {{ paymentData.orderId }}
        </div>
        <div *ngIf="paymentData?.transactionId" class="small">
          <strong>Mã giao dịch:</strong> {{ paymentData.transactionId }}
        </div>
      </div>
    </div>
    <div class="modal-footer border-0">
      <button type="button" class="btn" [ngClass]="getButtonClass()" (click)="activeModal.close()">
        {{ paymentData?.status === 'SUCCESS' ? 'Xác nhận' : 'Đóng' }}
      </button>
    </div>
  `,
  styles: [`
    .modal-header {
      padding: 1.5rem;
      background: #f8f9fa;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      background: #f8f9fa;
    }

    .alert-success {
      background-color: #d4edda;
      border-color: #c3e6cb;
      color: #155724;
    }

    .alert-danger {
      background-color: #f8d7da;
      border-color: #f5c6cb;
      color: #721c24;
    }

    .alert-warning {
      background-color: #fff3cd;
      border-color: #ffeeba;
      color: #856404;
    }

    .text-success {
      color: #28a745 !important;
    }

    .text-danger {
      color: #dc3545 !important;
    }

    .text-warning {
      color: #ffc107 !important;
    }

    .btn-success {
      background-color: #28a745;
      border-color: #28a745;
      color: white;
    }

    .btn-success:hover {
      background-color: #218838;
      border-color: #1e7e34;
    }

    .btn-danger {
      background-color: #dc3545;
      border-color: #dc3545;
      color: white;
    }

    .btn-danger:hover {
      background-color: #c82333;
      border-color: #bd2130;
    }
  `]
})
export class PaymentNotificationModalComponent {
  @Input() paymentData: any;

  constructor(public activeModal: NgbActiveModal) {}

  getTitle(): string {
    switch (this.paymentData?.status) {
      case 'SUCCESS':
        return '✓ Thanh toán thành công';
      case 'FAILED':
        return '✗ Thanh toán thất bại';
      case 'ERROR':
        return '⚠ Lỗi thanh toán';
      default:
        return 'Thông báo thanh toán';
    }
  }

  getHeaderClass(): string {
    switch (this.paymentData?.status) {
      case 'SUCCESS':
        return 'text-success';
      case 'FAILED':
        return 'text-danger';
      case 'ERROR':
        return 'text-warning';
      default:
        return 'text-dark';
    }
  }

  getIconClass(): string {
    switch (this.paymentData?.status) {
      case 'SUCCESS':
        return 'bi bi-check-circle-fill';
      case 'FAILED':
        return 'bi bi-x-circle-fill';
      case 'ERROR':
        return 'bi bi-exclamation-triangle-fill';
      default:
        return 'bi bi-info-circle-fill';
    }
  }

  getAlertClass(): string {
    switch (this.paymentData?.status) {
      case 'SUCCESS':
        return 'alert-success';
      case 'FAILED':
        return 'alert-danger';
      case 'ERROR':
        return 'alert-warning';
      default:
        return 'alert-info';
    }
  }

  getButtonClass(): string {
    switch (this.paymentData?.status) {
      case 'SUCCESS':
        return 'btn-success';
      case 'FAILED':
        return 'btn-danger';
      case 'ERROR':
        return 'btn-warning';
      default:
        return 'btn-primary';
    }
  }
}

