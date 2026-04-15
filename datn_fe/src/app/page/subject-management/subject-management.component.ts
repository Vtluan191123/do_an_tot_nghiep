import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubjectService } from '../../service/subject/subject.service';
import { UploadService } from '../../service/upload/upload.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {BASE_URL_UPLOAD} from '../../constants/constants';

interface SubjectModel {
  id?: number;
  name: string;
  description?: string;
  price: number;
  status: string;
  images?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-subject-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subject-management.component.html',
  styleUrl: './subject-management.component.scss'
})
export class SubjectManagementComponent implements OnInit, OnDestroy {
  subjects: SubjectModel[] = [];
  isLoading = false;
  showForm = false;
  isEditing = false;
  selectedSubject: SubjectModel | null = null;

  // Search and filter properties
  searchName = '';
  searchStatus = '';
  searchFromDate = '';
  searchToDate = '';

  // Pagination properties
  currentPage = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50, 100];
  totalElements = 0;
  totalPages = 0;

  formData: SubjectModel = {
    name: '',
    description: '',
    price: 0,
    status: 'ACTIVE',
    images: ''
  };

  private destroy$ = new Subject<void>();

  constructor(
    private subjectService: SubjectService,
    private uploadService: UploadService,
    private toastr: ToastrService
  ) {
  }

  ngOnInit(): void {
    this.loadSubjects();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSubjects(): void {
    this.isLoading = true;
    const filter = {
      page: this.currentPage,
      size: this.pageSize,
      sortBy: 'id',
      sortDirection: 'DESC',
      keyword: this.searchName.trim() || undefined,
      status: this.searchStatus || undefined,
      fromDate: this.searchFromDate || undefined,
      toDate: this.searchToDate || undefined
    };

    this.subjectService.getAllSubjects(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.subjects = response.data;
            this.totalElements = response.count || 0;
            this.totalPages = Math.ceil(this.totalElements / this.pageSize);
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
        }
      });
  }

  openForm(subject?: SubjectModel): void {
    this.showForm = true;
    if (subject) {
      this.isEditing = true;
      this.selectedSubject = subject;
      this.formData = {...subject};
    } else {
      this.isEditing = false;
      this.selectedSubject = null;
      this.formData = {name: '', description: '', price: 0, status: 'ACTIVE', images: ''};
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.selectedSubject = null;
    this.formData = {name: '', description: '', price: 0, status: 'ACTIVE', images: ''};
  }

  saveSubject(): void {
    if (!this.formData.name) {
      this.toastr.warning('Vui lòng điền tên môn học');
      return;
    }

    if (this.formData.price <= 0) {
      this.toastr.warning('Vui lòng nhập giá tiền > 0');
      return;
    }

    if (!this.formData.status) {
      this.toastr.warning('Vui lòng chọn trạng thái');
      return;
    }

    if (this.isEditing && this.selectedSubject?.id) {
      const updateRequest = {
        id: this.selectedSubject.id,
        ...this.formData
      };
      this.subjectService.updateSubject(updateRequest)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success('Cập nhật môn học thành công');
            this.closeForm();
            this.loadSubjects();
          },
          error: (error) => {
            console.error('Error updating subject:', error);
            this.toastr.error('Lỗi cập nhật môn học');
          }
        });
    } else {
      this.subjectService.createSubject(this.formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success('Thêm môn học thành công');
            this.closeForm();
            this.loadSubjects();
          },
          error: (error) => {
            console.error('Error creating subject:', error);
            this.toastr.error('Lỗi thêm môn học');
          }
        });
    }
  }

  deleteSubject(id: number): void {
    if (confirm('Bạn có chắc muốn xóa môn học này?')) {
      this.subjectService.deleteSubject(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success('Xóa môn học thành công');
            this.loadSubjects();
          },
          error: (error) => {
            console.error('Error deleting subject:', error);
            this.toastr.error('Lỗi xóa môn học');
          }
        });
    }
  }

  onImageSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.toastr.error('Kích thước file không được vượt quá 5MB');
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        this.toastr.error('Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WebP)');
        return;
      }

      // Upload file to server
      this.uploadService.uploadFile(file)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            if (response && response.data && response.data.length > 0) {
              // Set the image path from the uploaded file
              this.formData.images = response.data[0];
              this.toastr.success('Upload ảnh thành công');
            }
          },
          error: (error) => {
            console.error('Error uploading image:', error);
            this.toastr.error('Lỗi upload ảnh');
          }
        });
    }
  }

  // Search and filter methods
  onSearch(): void {
    this.currentPage = 0; // Reset to first page when searching
    this.loadSubjects();
  }

  onReset(): void {
    this.searchName = '';
    this.searchStatus = '';
    this.searchFromDate = '';
    this.searchToDate = '';
    this.currentPage = 0;
    this.loadSubjects();
  }

  onPageChange(page: number): void {
    // Check if page is valid
    if (page < 0 || page >= this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.loadSubjects();
  }

  /**
   * Go to next page
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadSubjects();
    }
  }

  /**
   * Go to previous page
   */
  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadSubjects();
    }
  }

  /**
   * Go to first page
   */
  firstPage(): void {
    this.currentPage = 0;
    this.loadSubjects();
  }

  /**
   * Go to last page
   */
  lastPage(): void {
    this.currentPage = this.totalPages - 1;
    this.loadSubjects();
  }

  /**
   * Change page size and reset to first page
   */
  changePageSize(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 0;
    this.loadSubjects();
  }

  /**
   * Go to specific page
   */
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadSubjects();
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

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 0; i < this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }


  protected readonly BASE_URL_UPLOAD = BASE_URL_UPLOAD;
  protected readonly Math = Math;
}
