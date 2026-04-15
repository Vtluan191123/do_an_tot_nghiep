import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComboService } from '../../service/combo/combo.service';
import { SubjectService } from '../../service/subject/subject.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BASE_URL_UPLOAD } from '../../constants/constants';

interface Combo {
  id?: number;
  code: string;
  name: string;
  description: string;
  prices: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ComboSubject {
  subjectId: number;
  totalTeach: number;
}

interface SubjectOption {
  id: number;
  name: string;
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

  // Pagination properties
  currentPage: number = 0;
  pageSize: number = 10;
  pageSizeOptions: number[] = [5, 10, 15, 20, 50];
  totalCombos: number = 0;
  totalPages: number = 0;

  // Search and filter properties
  searchCode = '';
  searchName = '';
  searchFromDate = '';
  searchToDate = '';
  searchSubjectId: number | null = null;

  // Subject management
  subjects: SubjectOption[] = [];
  selectedSubjects: ComboSubject[] = [];

  formData: Combo = {
    code: '',
    name: '',
    description: '',
    prices: 0
  };

  private destroy$ = new Subject<void>();

  constructor(
    private comboService: ComboService,
    private subjectService: SubjectService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadSubjects();
    this.loadCombos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load all subjects for dropdown
   */
  loadSubjects(): void {
    const filter = {
      page: 0,
      size: 1000,
      sortBy: 'id',
      sortDirection: 'DESC'
    };

    this.subjectService.getAllSubjects(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.subjects = response.data.map((subject: any) => ({
              id: subject.id,
              name: subject.name
            }));
          }
        },
        error: (error) => {
          console.error('Error loading subjects:', error);
        }
      });
  }

  loadCombos(): void {
    this.isLoading = true;

    // Combine search fields into keyword for backend to LIKE with OR
    let keyword = '';
    if (this.searchCode.trim()) {
      keyword = this.searchCode.trim();
    } else if (this.searchName.trim()) {
      keyword = this.searchName.trim();
    }

    const filter: any = {
      page: this.currentPage,
      size: this.pageSize,
      sortBy: 'id',
      sortDirection: 'DESC',
      keyword: keyword || undefined,
      fromDate: this.searchFromDate || undefined,
      toDate: this.searchToDate || undefined
    };

    // Add subject filter if selected
    if (this.searchSubjectId) {
      filter.subjectId = this.searchSubjectId;
    }

    this.comboService.getAllCombos(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.combos = response.data;
            this.totalCombos = response.count || 0;
            this.totalPages = Math.ceil(this.totalCombos / this.pageSize);
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
        }
      });
  }

  // Search and filter methods
  onSearch(): void {
    this.currentPage = 0; // Reset to first page when searching
    this.loadCombos();
  }

  onReset(): void {
    this.searchCode = '';
    this.searchName = '';
    this.searchFromDate = '';
    this.searchToDate = '';
    this.searchSubjectId = null;
    this.currentPage = 0;
    this.loadCombos();
  }

  /**
   * Go to next page
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadCombos();
    }
  }

  /**
   * Go to previous page
   */
  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadCombos();
    }
  }

  /**
   * Go to first page
   */
  firstPage(): void {
    this.currentPage = 0;
    this.loadCombos();
  }

  /**
   * Go to last page
   */
  lastPage(): void {
    this.currentPage = this.totalPages - 1;
    this.loadCombos();
  }

  /**
   * Change page size and reset to first page
   */
  changePageSize(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 0;
    this.loadCombos();
  }

  /**
   * Go to specific page
   */
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadCombos();
    }
  }

  /**
   * Generate pagination numbers to display
   */
  getPaginationNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 0; i < this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show current page and surrounding pages
      let startPage = Math.max(0, this.currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(this.totalPages - 1, startPage + maxPagesToShow - 1);

      // Adjust start page if we're near the end
      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(0, endPage - maxPagesToShow + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  /**
   * Get available subjects (not already selected)
   */
  getAvailableSubjects(currentSubjectId?: number): SubjectOption[] {
    return this.subjects.filter(subject =>
      !this.selectedSubjects.some(s => s.subjectId === subject.id) || (currentSubjectId && subject.id === currentSubjectId)
    );
  }

  /**
   * Get subject name by ID
   */
  getSubjectName(subjectId: number): string {
    const subject = this.subjects.find(s => s.id === subjectId);
    return subject ? subject.name : '';
  }

  /**
   * Add subject to combo
   */
  addSubject(): void {
    if (this.getAvailableSubjects().length === 0) {
      this.toastr.warning('Đã thêm tất cả môn học');
      return;
    }

    const newSubject: ComboSubject = {
      subjectId: 0,
      totalTeach: 1
    };
    this.selectedSubjects.push(newSubject);
  }

  /**
   * Remove subject from combo
   */
  removeSubject(index: number): void {
    this.selectedSubjects.splice(index, 1);
  }

  openForm(combo?: Combo): void {
    this.showForm = true;
    this.selectedSubjects = [];

    if (combo && combo.id) {
      this.isEditing = true;
      this.selectedCombo = combo;
      this.formData = { ...combo };

      // Load combo details with subjects
      this.comboService.getComboDetail(combo.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            if (response && response.data) {
              const comboDetail = response.data;
              this.formData = {
                id: comboDetail.id,
                code: comboDetail.code,
                name: comboDetail.name,
                description: comboDetail.description,
                prices: comboDetail.prices,
                createdAt: comboDetail.createdAt,
                updatedAt: comboDetail.updatedAt
              };

              // Load subjects if available from backend
              if (comboDetail.comboSubjects && Array.isArray(comboDetail.comboSubjects)) {
                this.selectedSubjects = comboDetail.comboSubjects.map((cs: any) => ({
                  subjectId: cs.subjectId,
                  totalTeach: cs.totalTeach
                }));
              }
            }
          },
          error: (error) => {
            console.error('Error loading combo details:', error);
            this.toastr.error('Lỗi tải chi tiết combo');
          }
        });
    } else {
      this.isEditing = false;
      this.selectedCombo = null;
      this.formData = { code: '', name: '', description: '', prices: 0 };
      this.selectedSubjects = [];
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.selectedCombo = null;
    this.formData = { code: '', name: '', description: '', prices: 0 };
    this.selectedSubjects = [];
  }

  saveCombo(): void {
    if (!this.formData.code || !this.formData.name) {
      this.toastr.warning('Vui lòng điền đủ các trường bắt buộc');
      return;
    }

    if (this.selectedSubjects.length === 0) {
      this.toastr.warning('Vui lòng thêm ít nhất 1 môn học');
      return;
    }

    // Validate all subjects have IDs and totalTeach
    for (let subject of this.selectedSubjects) {
      if (!subject.subjectId || subject.subjectId === 0) {
        this.toastr.warning('Vui lòng chọn môn học cho tất cả dòng');
        return;
      }
      if (!subject.totalTeach || subject.totalTeach <= 0) {
        this.toastr.warning('Vui lòng nhập số buổi học > 0 cho tất cả môn');
        return;
      }
    }

    if (this.isEditing && this.selectedCombo?.id) {
      const updateRequest = {
        id: this.selectedCombo.id,
        code: this.formData.code,
        name: this.formData.name,
        description: this.formData.description,
        prices: this.formData.prices,
        comboSubjectRequests: this.selectedSubjects.map(subject => ({
          id: subject.subjectId,
          totalTeach: subject.totalTeach
        }))
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
      const createRequest = {
        code: this.formData.code,
        name: this.formData.name,
        description: this.formData.description,
        prices: this.formData.prices,
        comboSubjectRequests: this.selectedSubjects.map(subject => ({
          id: subject.subjectId,
          totalTeach: subject.totalTeach
        }))
      };

      this.comboService.createCombo(createRequest)
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

  protected readonly BASE_URL_UPLOAD = BASE_URL_UPLOAD;
}
