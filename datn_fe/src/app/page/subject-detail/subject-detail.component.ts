import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SubjectService } from '../../service/subject/subject.service';
import { NavComponent } from '../share/nav/nav.component';
import { FooterComponent } from '../share/footer/footer.component';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BASE_URL_UPLOAD } from '../../constants/constants';

@Component({
  selector: 'app-subject-detail',
  standalone: true,
  imports: [CommonModule, NavComponent, FooterComponent, FormsModule],
  templateUrl: './subject-detail.component.html',
  styleUrls: ['./subject-detail.component.scss']
})
export class SubjectDetailComponent implements OnInit, OnDestroy {

  subject: any = null;
  loading: boolean = true;
  error: string = '';
  sessions: number = 1;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private subjectService: SubjectService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadSubjectDetail();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load subject details based on route ID
   */
  loadSubjectDetail(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = params.get('id');
        console.log('loadSubjectDetail - ID from route:', id);

        if (id) {
          this.subjectService.getSubjectById(Number(id))
            .pipe(takeUntil(this.destroy$))
            .subscribe(
              (response: any) => {
                console.log('getSubjectDetail response:', response);

                if (response && response.status === 200 && response.data) {
                  this.subject = response.data;
                  console.log('Subject loaded successfully:', this.subject);
                  this.loading = false;
                } else {
                  console.warn('Invalid response structure:', response);
                  this.error = 'Không tìm thấy môn học';
                  this.loading = false;
                }
              },
              (error: any) => {
                console.error('Error loading subject:', error);
                this.error = `Lỗi khi tải thông tin môn học: ${error?.status} ${error?.statusText}`;
                this.loading = false;
              }
            );
        } else {
          console.warn('No ID found in route params');
          this.error = 'Không tìm thấy ID môn học';
          this.loading = false;
        }
      });
  }

  /**
   * Navigate back to dashboard
   */
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Enroll and go to payment page
   */
  enroll(): void {
    if (!this.subject || this.sessions < 1) return;

    // Store enrollment data and navigate to payment
    const enrollmentData = {
      subjectId: this.subject.id,
      subjectName: this.subject.name,
      sessions: this.sessions,
      price: this.subject.price,
      totalAmount: Number(this.subject.price) * this.sessions
    };

    localStorage.setItem('enrollmentData', JSON.stringify(enrollmentData));
    this.router.navigate(['/payment']);
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

  /**
   * Calculate total amount
   */
  getTotalAmount(): number {
    if (!this.subject || !this.subject.price) return 0;
    return Number(this.subject.price) * this.sessions;
  }

  protected readonly BASE_URL_UPLOAD = BASE_URL_UPLOAD;
}

