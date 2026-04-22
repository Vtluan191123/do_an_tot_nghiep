import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiTrainingTopicService } from '../../service/ai-training/ai-training-topic.service';
import { AiTrainingQuestionService } from '../../service/ai-training/ai-training-question.service';
import { AiTrainingAnswerService } from '../../service/ai-training/ai-training-answer.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Topic {
  id?: number;
  topicName: string;
  code: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Question {
  id?: number;
  topicId: number;
  content: string;
  status: number; // 0: no answer, 1: has answer
  createdAt?: string;
  updatedAt?: string;
}

interface Answer {
  id?: number;
  questionId: number;
  type: string; // text or image
  content: string;
  position?: number;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-ai-training-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-training-management.component.html',
  styleUrl: './ai-training-management.component.scss'
})
export class AiTrainingManagementComponent implements OnInit, OnDestroy {

  // ===== Tabs =====
  activeTab: 'topic' | 'question' | 'answer' = 'topic';

  // ===== Topics Management =====
  topics: Topic[] = [];
  selectedTopic: Topic | null = null;
  topicFormData: Topic = { topicName: '', code: '', description: '' };
  showTopicForm = false;
  isEditingTopic = false;

  // ===== Questions Management =====
  questions: Question[] = [];
  selectedQuestion: Question | null = null;
  questionFormData: Question = { topicId: 0, content: '', status: 0 };
  showQuestionForm = false;
  isEditingQuestion = false;

  // ===== Answers Management =====
  answers: Answer[] = [];
  selectedAnswer: Answer | null = null;
  answerFormData: Answer = { questionId: 0, type: 'text', content: '', position: 0 };
  showAnswerForm = false;
  isEditingAnswer = false;

  // ===== Pagination & Search =====
  currentPage = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50, 100];
  totalElements = 0;
  totalPages = 0;

  searchTopicName = '';
  searchTopicCode = '';
  searchQuestionContent = '';
  searchQuestionStatus = '';
  searchQuestionTopicId: number | null = null;

  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private aiTrainingTopicService: AiTrainingTopicService,
    private aiTrainingQuestionService: AiTrainingQuestionService,
    private aiTrainingAnswerService: AiTrainingAnswerService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadTopics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===========================
  // ===== TOPIC MANAGEMENT =====
  // ===========================

  loadTopics(): void {
    this.isLoading = true;
    const filter = {
      topicName: this.searchTopicName,
      code: this.searchTopicCode,
      page: this.currentPage,
      size: this.pageSize
    };

    this.aiTrainingTopicService.getAllTopics(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.topics = response.data || [];
          this.totalElements = response.totalElements || 0;
          this.totalPages = response.totalPages || 0;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading topics:', error);
          this.isLoading = false;
          this.toastr.error('Lỗi tải danh sách chủ đề');
        }
      });
  }

  openTopicForm(topic?: Topic): void {
    this.showTopicForm = true;
    if (topic) {
      this.isEditingTopic = true;
      this.selectedTopic = topic;
      this.topicFormData = { ...topic };
    } else {
      this.isEditingTopic = false;
      this.selectedTopic = null;
      this.topicFormData = { topicName: '', code: '', description: '' };
    }
  }

  closeTopicForm(): void {
    this.showTopicForm = false;
    this.isEditingTopic = false;
    this.selectedTopic = null;
    this.topicFormData = { topicName: '', code: '', description: '' };
  }

  saveTopicData(): void {
    if (!this.topicFormData.topicName || !this.topicFormData.code) {
      this.toastr.warning('Vui lòng điền tất cả các trường bắt buộc');
      return;
    }

    if (this.isEditingTopic && this.topicFormData.id) {
      this.aiTrainingTopicService.updateTopic(this.topicFormData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success('Cập nhật chủ đề thành công');
            this.closeTopicForm();
            this.loadTopics();
          },
          error: (error) => {
            console.error('Error updating topic:', error);
            this.toastr.error('Lỗi cập nhật chủ đề');
          }
        });
    } else {
      this.aiTrainingTopicService.createTopic(this.topicFormData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success('Thêm chủ đề thành công');
            this.closeTopicForm();
            this.loadTopics();
          },
          error: (error) => {
            console.error('Error creating topic:', error);
            this.toastr.error('Lỗi thêm chủ đề');
          }
        });
    }
  }

  deleteTopicData(id?: number): void {
    if (!id) {
      this.toastr.warning('Chọn chủ đề để xóa');
      return;
    }

    if (!confirm('Bạn chắc chắn muốn xóa chủ đề này?')) {
      return;
    }

    this.aiTrainingTopicService.deleteTopic(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Xóa chủ đề thành công');
          this.loadTopics();
        },
        error: (error) => {
          console.error('Error deleting topic:', error);
          this.toastr.error('Lỗi xóa chủ đề');
        }
      });
  }

  onSearchTopic(): void {
    this.currentPage = 0;
    this.loadTopics();
  }

  onResetTopic(): void {
    this.searchTopicName = '';
    this.searchTopicCode = '';
    this.currentPage = 0;
    this.loadTopics();
  }

  // ==============================
  // ===== QUESTION MANAGEMENT =====
  // ==============================

  loadQuestions(): void {
    this.isLoading = true;
    const filter = {
      topicId: this.searchQuestionTopicId,
      content: this.searchQuestionContent,
      status: this.searchQuestionStatus ? parseInt(this.searchQuestionStatus) : null,
      page: this.currentPage,
      size: this.pageSize
    };

    this.aiTrainingQuestionService.getAllQuestions(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.questions = response.data || [];
          this.totalElements = response.totalElements || 0;
          this.totalPages = response.totalPages || 0;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading questions:', error);
          this.isLoading = false;
          this.toastr.error('Lỗi tải danh sách câu hỏi');
        }
      });
  }

  openQuestionForm(question?: Question): void {
    this.showQuestionForm = true;
    if (question) {
      this.isEditingQuestion = true;
      this.selectedQuestion = question;
      this.questionFormData = { ...question };
    } else {
      this.isEditingQuestion = false;
      this.selectedQuestion = null;
      this.questionFormData = { topicId: 0, content: '', status: 0 };
    }
  }

  closeQuestionForm(): void {
    this.showQuestionForm = false;
    this.isEditingQuestion = false;
    this.selectedQuestion = null;
    this.questionFormData = { topicId: 0, content: '', status: 0 };
  }

  saveQuestionData(): void {
    if (!this.questionFormData.topicId || !this.questionFormData.content) {
      this.toastr.warning('Vui lòng điền tất cả các trường bắt buộc');
      return;
    }

    if (this.isEditingQuestion && this.questionFormData.id) {
      this.aiTrainingQuestionService.updateQuestion(this.questionFormData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success('Cập nhật câu hỏi thành công');
            this.closeQuestionForm();
            this.loadQuestions();
          },
          error: (error) => {
            console.error('Error updating question:', error);
            this.toastr.error('Lỗi cập nhật câu hỏi');
          }
        });
    } else {
      this.aiTrainingQuestionService.createQuestion(this.questionFormData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success('Thêm câu hỏi thành công');
            this.closeQuestionForm();
            this.loadQuestions();
          },
          error: (error) => {
            console.error('Error creating question:', error);
            this.toastr.error('Lỗi thêm câu hỏi');
          }
        });
    }
  }

  deleteQuestionData(id?: number): void {
    if (!id) {
      this.toastr.warning('Chọn câu hỏi để xóa');
      return;
    }

    if (!confirm('Bạn chắc chắn muốn xóa câu hỏi này?')) {
      return;
    }

    this.aiTrainingQuestionService.deleteQuestion(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Xóa câu hỏi thành công');
          this.loadQuestions();
        },
        error: (error) => {
          console.error('Error deleting question:', error);
          this.toastr.error('Lỗi xóa câu hỏi');
        }
      });
  }

  onSearchQuestion(): void {
    this.currentPage = 0;
    this.loadQuestions();
  }

  onResetQuestion(): void {
    this.searchQuestionContent = '';
    this.searchQuestionStatus = '';
    this.searchQuestionTopicId = null;
    this.currentPage = 0;
    this.loadQuestions();
  }

  // ============================
  // ===== ANSWER MANAGEMENT =====
  // ============================

  loadAnswers(): void {
    this.isLoading = true;
    const filter = {
      page: this.currentPage,
      size: this.pageSize
    };

    this.aiTrainingAnswerService.getAllAnswers(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.answers = response.data || [];
          this.totalElements = response.totalElements || 0;
          this.totalPages = response.totalPages || 0;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading answers:', error);
          this.isLoading = false;
          this.toastr.error('Lỗi tải danh sách câu trả lời');
        }
      });
  }

  openAnswerForm(answer?: Answer): void {
    this.showAnswerForm = true;
    if (answer) {
      this.isEditingAnswer = true;
      this.selectedAnswer = answer;
      this.answerFormData = { ...answer };
    } else {
      this.isEditingAnswer = false;
      this.selectedAnswer = null;
      this.answerFormData = { questionId: 0, type: 'text', content: '', position: 0 };
    }
  }

  closeAnswerForm(): void {
    this.showAnswerForm = false;
    this.isEditingAnswer = false;
    this.selectedAnswer = null;
    this.answerFormData = { questionId: 0, type: 'text', content: '', position: 0 };
  }

  saveAnswerData(): void {
    if (!this.answerFormData.questionId || !this.answerFormData.content || !this.answerFormData.type) {
      this.toastr.warning('Vui lòng điền tất cả các trường bắt buộc');
      return;
    }

    if (this.isEditingAnswer && this.answerFormData.id) {
      this.aiTrainingAnswerService.updateAnswer(this.answerFormData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success('Cập nhật câu trả lời thành công');
            this.closeAnswerForm();
            this.loadAnswers();
          },
          error: (error) => {
            console.error('Error updating answer:', error);
            this.toastr.error('Lỗi cập nhật câu trả lời');
          }
        });
    } else {
      this.aiTrainingAnswerService.createAnswer(this.answerFormData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success('Thêm câu trả lời thành công');
            this.closeAnswerForm();
            this.loadAnswers();
          },
          error: (error) => {
            console.error('Error creating answer:', error);
            this.toastr.error('Lỗi thêm câu trả lời');
          }
        });
    }
  }

  deleteAnswerData(id?: number): void {
    if (!id) {
      this.toastr.warning('Chọn câu trả lời để xóa');
      return;
    }

    if (!confirm('Bạn chắc chắn muốn xóa câu trả lời này?')) {
      return;
    }

    this.aiTrainingAnswerService.deleteAnswer(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Xóa câu trả lời thành công');
          this.loadAnswers();
        },
        error: (error) => {
          console.error('Error deleting answer:', error);
          this.toastr.error('Lỗi xóa câu trả lời');
        }
      });
  }

  // ===== Pagination =====

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadCurrentTab();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadCurrentTab();
    }
  }

  firstPage(): void {
    this.currentPage = 0;
    this.loadCurrentTab();
  }

  lastPage(): void {
    this.currentPage = this.totalPages - 1;
    this.loadCurrentTab();
  }

  changePageSize(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 0;
    this.loadCurrentTab();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadCurrentTab();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 0; i < this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // ===== Tab Switching =====

  switchTab(tab: 'topic' | 'question' | 'answer'): void {
    this.activeTab = tab;
    this.currentPage = 0;
    this.loadCurrentTab();
  }

  private loadCurrentTab(): void {
    switch (this.activeTab) {
      case 'topic':
        this.loadTopics();
        break;
      case 'question':
        this.loadQuestions();
        break;
      case 'answer':
        this.loadAnswers();
        break;
    }
  }

  getTopicName(topicId: number): string {
    const topic = this.topics.find(t => t.id === topicId);
    return topic ? topic.topicName : 'N/A';
  }

  getQuestionContent(questionId: any): string {
    const question = this.questions.find(q => q.id === questionId);
    return question ? question.content.substring(0, 50) + (question.content.length > 50 ? '...' : '') : 'N/A';
  }

  getStatusLabel(status: number): string {
    return status === 0 ? 'Chưa có câu trả lời' : 'Có câu trả lời';
  }
}

