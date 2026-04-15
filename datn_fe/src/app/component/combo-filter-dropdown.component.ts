// combo-filter-dropdown.component.ts - Component hiển thị dropdown và search combo

import { Component, OnInit } from '@angular/core';
import { ComboSubjectDropdown } from '../model/combo-filter.model';
import {ComboFilterService} from '../service/combo-filter.service';

@Component({
  selector: 'app-combo-filter-dropdown',
  template: `
    <div class="combo-filter-container">
      <div class="filter-row">
        <div class="filter-group">
          <label for="subjectDropdown">Chọn Môn Học:</label>
          <select
            id="subjectDropdown"
            [(ngModel)]="selectedSubjectId"
            (change)="onSubjectChange()"
            [disabled]="loadingSubjects">
            <option value="">-- Tất cả môn học --</option>
            <option *ngFor="let subject of subjects" [value]="subject.id">
              {{ subject.name }}
            </option>
          </select>
          <span *ngIf="loadingSubjects" class="loading-spinner">Đang tải...</span>
        </div>

        <div class="filter-group">
          <label for="keywordInput">Từ khóa tìm kiếm:</label>
          <input
            id="keywordInput"
            type="text"
            [(ngModel)]="keyword"
            placeholder="Tìm kiếm combo..."
            (keyup.enter)="searchCombos()">
        </div>

        <button
          (click)="searchCombos()"
          [disabled]="loadingCombos"
          class="btn-search">
          Tìm kiếm
        </button>

        <button
          (click)="resetFilter()"
          class="btn-reset">
          Reset
        </button>
      </div>

      <!-- Hiển thị kết quả combo -->
      <div *ngIf="combos && combos.length > 0" class="combo-list">
        <div *ngFor="let combo of combos" class="combo-item">
          <h4>{{ combo.name }}</h4>
          <p class="code">Mã: {{ combo.code }}</p>
          <p class="price">Giá: {{ combo.prices | currency }}</p>
          <p class="description">{{ combo.description }}</p>
        </div>
      </div>

      <!-- Không tìm thấy kết quả -->
      <div *ngIf="searched && combos.length === 0" class="no-results">
        <p>Không tìm thấy combo nào</p>
      </div>

      <!-- Loading -->
      <div *ngIf="loadingCombos" class="loading">
        <p>Đang tải dữ liệu...</p>
      </div>
    </div>
  `,
  styles: [`
    .combo-filter-container {
      padding: 20px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .filter-row {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      flex-wrap: wrap;
      align-items: flex-end;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 200px;
    }

    .filter-group label {
      font-weight: bold;
      margin-bottom: 5px;
      color: #333;
    }

    .filter-group select,
    .filter-group input {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .filter-group select:focus,
    .filter-group input:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
    }

    .btn-search,
    .btn-reset {
      padding: 8px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
    }

    .btn-search {
      background: #007bff;
      color: white;
    }

    .btn-search:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-reset {
      background: #6c757d;
      color: white;
    }

    .btn-reset:hover {
      background: #545b62;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .loading-spinner {
      font-size: 12px;
      color: #007bff;
      margin-top: 5px;
    }

    .combo-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 15px;
    }

    .combo-item {
      background: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .combo-item h4 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .combo-item p {
      margin: 5px 0;
      font-size: 14px;
      color: #666;
    }

    .combo-item .code {
      font-weight: bold;
      color: #007bff;
    }

    .combo-item .price {
      font-weight: bold;
      color: #28a745;
      font-size: 16px;
    }

    .no-results,
    .loading {
      text-align: center;
      padding: 30px;
      background: white;
      border-radius: 8px;
      color: #666;
    }
  `]
})
export class ComboFilterDropdownComponent implements OnInit {

  subjects: ComboSubjectDropdown[] = [];
  combos: any[] = [];

  selectedSubjectId: any = '';
  keyword: string = '';

  loadingSubjects: boolean = false;
  loadingCombos: boolean = false;
  searched: boolean = false;

  constructor(private comboFilterService: ComboFilterService) {}

  ngOnInit(): void {
    this.loadSubjects();
  }

  /**
   * Tải danh sách subject cho dropdown
   */
  loadSubjects(): void {
    this.loadingSubjects = true;
    this.comboFilterService.getSubjectsForDropdown().subscribe(
      (response:any) => {
        if (response.status === 200) {
          this.subjects = response.data;
        }
        this.loadingSubjects = false;
      },
      (error:any) => {
        console.error('Lỗi khi tải subject:', error);
        this.loadingSubjects = false;
      }
    );
  }

  /**
   * Xử lý khi chọn subject từ dropdown
   */
  onSubjectChange(): void {
    if (this.selectedSubjectId) {
      this.searchCombos();
    }
  }

  /**
   * Tìm kiếm combo
   */
  searchCombos(): void {
    this.loadingCombos = true;
    this.searched = true;

    const filter: any = {
      page: 0,
      size: 20,
      sortBy: 'id',
      sortDirection: 'DESC'
    };

    // Thêm filter nếu có chọn subject
    if (this.selectedSubjectId) {
      filter.subjectId = this.selectedSubjectId;
    }

    // Thêm filter nếu có keyword
    if (this.keyword && this.keyword.trim()) {
      filter.keyword = this.keyword.trim();
    }

    this.comboFilterService.searchCombos(filter).subscribe(
      (response:any) => {
        if (response.status === 200) {
          this.combos = response.data;
        }
        this.loadingCombos = false;
      },
      (error:any) => {
        console.error('Lỗi khi tìm kiếm combo:', error);
        this.loadingCombos = false;
        this.combos = [];
      }
    );
  }

  /**
   * Reset filter
   */
  resetFilter(): void {
    this.selectedSubjectId = '';
    this.keyword = '';
    this.combos = [];
    this.searched = false;
  }
}

