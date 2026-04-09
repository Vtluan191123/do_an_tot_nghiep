import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ComboService } from '../../service/combo/combo.service';
import { Combo } from '../../model/combo.model';
import { NavComponent } from '../share/nav/nav.component';
import { FooterComponent } from '../share/footer/footer.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-combo-detail',
  standalone: true,
  imports: [CommonModule, NavComponent, FooterComponent, FormsModule],
  templateUrl: './combo-detail.component.html',
  styleUrls: ['./combo-detail.component.scss']
})
export class ComboDetailComponent implements OnInit {

  combo: Combo | null = null;
  loading: boolean = true;
  error: string = '';
  quantity: number = 1;
  showPaymentModal: boolean = false;

  // Payment form
  paymentForm = {
    fullName: '',
    email: '',
    phone: '',
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private comboService: ComboService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadComboDetail();
  }

  /**
   * Load combo details based on route ID
   */
  loadComboDetail(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.comboService.getComboById(Number(id)).subscribe(
          (response: any) => {
            if (response.status === 200) {
              this.combo = response.data;
              this.loading = false;
            } else {
              this.error = 'Không tìm thấy gói combo';
              this.loading = false;
            }
          },
          (error) => {
            console.error('Error loading combo:', error);
            this.error = 'Lỗi khi tải thông tin gói combo';
            this.loading = false;
          }
        );
      }
    });
  }

  /**
   * Open payment modal
   */
  openPaymentModal(): void {
    if (!this.paymentForm.fullName || !this.paymentForm.email || !this.paymentForm.phone) {
      alert('Vui lòng điền đầy đủ thông tin cá nhân');
      return;
    }
    this.showPaymentModal = true;
  }

  /**
   * Close payment modal
   */
  closePaymentModal(): void {
    this.showPaymentModal = false;
  }

  /**
   * Process payment
   */
  processPayment(): void {
    if (!this.validatePaymentForm()) {
      alert('Vui lòng điền đầy đủ thông tin thanh toán');
      return;
    }

    // Simulate payment processing
    console.log('Processing payment...', this.paymentForm);
    alert('Thanh toán thành công! Cảm ơn bạn đã mua gói ' + this.combo?.name);

    // Reset form and close modal
    this.resetPaymentForm();
    this.showPaymentModal = false;

    // Redirect to dashboard
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 1500);
  }

  /**
   * Validate payment form
   */
  validatePaymentForm(): boolean {
    return this.paymentForm.cardNumber.length >= 16 &&
           this.paymentForm.cardHolder.trim() !== '' &&
           this.paymentForm.expiryDate.match(/^\d{2}\/\d{2}$/) !== null &&
           this.paymentForm.cvv.length === 3;
  }

  /**
   * Reset payment form
   */
  resetPaymentForm(): void {
    this.paymentForm = {
      fullName: '',
      email: '',
      phone: '',
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: ''
    };
  }

  /**
   * Calculate total price
   */
  getTotalPrice(): number {
    if (this.combo) {
      return this.combo.prices * this.quantity;
    }
    return 0;
  }

  /**
   * Go back to dashboard
   */
  goBack(): void {
    this.router.navigate(['/dashboard']);
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

  protected readonly Math = Math;
}

