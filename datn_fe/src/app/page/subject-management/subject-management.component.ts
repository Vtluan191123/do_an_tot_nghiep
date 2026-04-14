import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubjectService } from '../../service/subject/subject.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface SubjectModel {
  id?: number;
  code: string;
  name: string;
  description: string;
  price: number;
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

  formData: SubjectModel = {
    code: '',
    name: '',
    description: '',
    price: 0
  };

  private destroy$ = new Subject<void>();

  constructor(
    private subjectService: SubjectService,
    private toastr: ToastrService
  ) {}

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
      page: 0,
      size: 100,
      sortBy: 'id',
      sortDirection: 'DESC'
    };

    this.subjectService.getAllSubjects(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.subjects = response.data;
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading subjects:', error);
          this.toastr.error('Lỗi tải danh sách môn học');
          this.isLoading = false;
        }
      });
  }

  openForm(subject?: SubjectModel): void {
    this.showForm = true;
    if (subject) {
      this.isEditing = true;
      this.selectedSubject = subject;
      this.formData = { ...subject };
    } else {
      this.isEditing = false;
      this.selectedSubject = null;
      this.formData = { code: '', name: '', description: '', price: 0 };
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.selectedSubject = null;
    this.formData = { code: '', name: '', description: '', price: 0 };
  }

  saveSubject(): void {
    if (!this.formData.code || !this.formData.name) {
      this.toastr.warning('Vui lòng điền đủ các trường bắt buộc');
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
}

