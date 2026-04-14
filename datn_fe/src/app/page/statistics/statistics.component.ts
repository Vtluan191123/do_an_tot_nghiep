import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsService } from '../../service/statistics/statistics.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface StatisticsSummary {
  totalBookings: number;
  totalUsers: number;
  totalSubjects: number;
  totalCombos: number;
  totalRevenue: number;
}

interface TopItem {
  id: number;
  code: string;
  name: string;
  price: number;
  purchaseCount: number;
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss'
})
export class StatisticsComponent implements OnInit, OnDestroy {
  isLoading = false;
  summary: StatisticsSummary | null = null;
  topCombos: TopItem[] = [];
  topSubjects: TopItem[] = [];
  revenueData: any = null;

  private destroy$ = new Subject<void>();

  constructor(
    private statisticsService: StatisticsService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStatistics(): void {
    this.isLoading = true;

    // Load all statistics
    this.statisticsService.getStatisticsSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.summary = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading summary:', error);
          this.toastr.error('Lỗi tải thống kê tóm tắt');
        }
      });

    // Load top combos
    this.statisticsService.getTopCombos(5)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.topCombos = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading top combos:', error);
          this.toastr.error('Lỗi tải top combo');
        }
      });

    // Load top subjects
    this.statisticsService.getTopSubjects(5)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.topSubjects = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading top subjects:', error);
          this.toastr.error('Lỗi tải top môn học');
        }
      });

    // Load revenue statistics
    this.statisticsService.getRevenueStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.revenueData = response.data;
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading revenue:', error);
          this.toastr.error('Lỗi tải thống kê doanh thu');
          this.isLoading = false;
        }
      });
  }

  formatCurrency(value: any): string {
    const num = Number(value);
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  }

  formatNumber(value: any): string {
    return Number(value).toLocaleString('vi-VN');
  }
}

