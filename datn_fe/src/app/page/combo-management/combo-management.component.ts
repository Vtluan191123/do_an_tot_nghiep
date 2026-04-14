import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComboService } from '../../service/combo/combo.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Combo {
  id?: number;
  code: string;
  name: string;
  description: string;
  prices: number;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-combo-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './combo-management.component.html',
  styleUrl: './combo-management.component.scss'
})
export class ComboManagementComponent implements OnInit, OnDestroy {
  combos: Combo[] = [];
  isLoading = false;
  showForm = false;
  isEditing = false;
  selectedCombo: Combo | null = null;

  formData: Combo = {
    code: '',
    name: '',
    description: '',
    prices: 0
  };

  private destroy$ = new Subject<void>();

  constructor(
    private comboService: ComboService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadCombos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCombos(): void {
    this.isLoading = true;
    const filter = {
      page: 0,
      size: 100,
      sortBy: 'id',
      sortDirection: 'DESC'
    };

    this.comboService.getAllCombos(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.combos = response.data;
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading combos:', error);
          this.toastr.error('Lỗi tải danh sách combo');
          this.isLoading = false;
        }
      });
  }

  openForm(combo?: Combo): void {
    this.showForm = true;
    if (combo) {
      this.isEditing = true;
      this.selectedCombo = combo;
      this.formData = { ...combo };
    } else {
      this.isEditing = false;
      this.selectedCombo = null;
      this.formData = { code: '', name: '', description: '', prices: 0 };
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.selectedCombo = null;
    this.formData = { code: '', name: '', description: '', prices: 0 };
  }

  saveCombo(): void {
    if (!this.formData.code || !this.formData.name) {
      this.toastr.warning('Vui lòng điền đủ các trường bắt buộc');
      return;
    }

    if (this.isEditing && this.selectedCombo?.id) {
      const updateRequest = {
        id: this.selectedCombo.id,
        ...this.formData
      };
      this.comboService.updateCombo(updateRequest)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success('Cập nhật combo thành công');
            this.closeForm();
            this.loadCombos();
          },
          error: (error) => {
            console.error('Error updating combo:', error);
            this.toastr.error('Lỗi cập nhật combo');
          }
        });
    } else {
      this.comboService.createCombo(this.formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success('Thêm combo thành công');
            this.closeForm();
            this.loadCombos();
          },
          error: (error) => {
            console.error('Error creating combo:', error);
            this.toastr.error('Lỗi thêm combo');
          }
        });
    }
  }

  deleteCombo(id: number): void {
    if (confirm('Bạn có chắc muốn xóa combo này?')) {
      this.comboService.deleteCombo(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success('Xóa combo thành công');
            this.loadCombos();
          },
          error: (error) => {
            console.error('Error deleting combo:', error);
            this.toastr.error('Lỗi xóa combo');
          }
        });
    }
  }
}

