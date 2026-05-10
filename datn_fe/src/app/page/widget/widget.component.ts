import { Component, OnInit, OnDestroy } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf, CommonModule} from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { WebsocketService } from '../../service/socket/websocket.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {BASE_TOPIC_SOCKET_FE, BASE_URL_UPLOAD} from '../../constants/constants';

export interface AiTrainingDto {
  topicCode: string;
  question: string;
  answer: AnswerItemDto[];
  isTrained: boolean;
}

export interface AnswerItemDto {
  content: string;
  isCorrect: boolean;
  type?: string;
}

export interface DisplayMessage {
  type: 'user' | 'ai-training' | 'ai-text';
  user?: string;
  aiTraining?: AiTrainingDto;
  aiText?: string;
  timestamp: Date;
}

@Component({
  selector: 'app-widget',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    CommonModule,
    HttpClientModule
  ],
  templateUrl: './widget.component.html',
  styleUrl: './widget.component.scss'
})
export class WidgetComponent implements OnInit, OnDestroy {
  position = { x: 20, y: 20 };

  isDragging = false;

  isOpen = false;
  messages: DisplayMessage[] = [];
  input = "";
  isLoading = false;  // Loading state for API call
  currentRequestId: string = '';  // Track current request
  selectedImage: string | null = null;  // Selected image for modal
  sessionId: string | null = null;  // AI session ID
  showNewSessionDialog = false;  // Show new session confirmation dialog

  private destroy$ = new Subject<void>();

  constructor(private webSocketService: WebsocketService, private http: HttpClient) {}

  ngOnInit(): void {
    this.webSocketService.connect();
    this.subscribeToAiResponse();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.webSocketService.disconnect();
  }

  subscribeToAiResponse(): void {
    const topic =BASE_TOPIC_SOCKET_FE + 'ai-response';
    console.log('[Widget] Subscribing to WebSocket topic:', topic);

    this.webSocketService.subscribeToTopic(topic)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (message) => {
          try {
            console.log('[Widget] Received WebSocket message from topic:', topic);
            const aiTrainingDto: AiTrainingDto = JSON.parse(message.body);

            // Turn off loading state when response received
            this.isLoading = false;

            this.messages.push({
              type: 'ai-training',
              aiTraining: aiTrainingDto,
              timestamp: new Date()
            });

            console.log('[Widget] Received AI Training Response:', aiTrainingDto);
            console.log('[Widget] Message count:', this.messages.length);
          } catch (error) {
            console.error('[Widget] Error parsing AI response:', error);
            this.isLoading = false;
          }
        },
        (error) => {
          console.error('[Widget] Error subscribing to AI response:', error);
          this.isLoading = false;
        }
      );
  }

  toggle(event: MouseEvent) {
    event.stopPropagation();
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      // Create AI session when opening chatbox
      this.createAiSession();
    } else {
      this.position = { x: 20, y: 20 };
      // Optional: Mark session as COMPLETED when closing
      // this.completeAiSession();
    }
  }

  /**
   * Create AI session when chatbox is opened
   */
  private createAiSession(): void {
    const apiUrl = `${environment.apiUrl}/api/ai-session/create`;
    const request = {
      userId: this.getCurrentUserId(), // Get from auth or localStorage
      description: 'AI Chat Session',
      metadata: {
        conversations: []
      }
    };

    this.http.post<any>(apiUrl, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          if (response.data) {
            this.sessionId = response.data.sessionId;
            console.log('[Widget] AI Session created:', this.sessionId);
          }
        },
        (error) => {
          console.error('[Widget] Error creating AI session:', error);
        }
      );
  }

  /**
   * Get current user ID from localStorage or auth service
   */
  private getCurrentUserId(): number {
    // TODO: Replace with actual auth service
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId) : 1; // Default to 1 if not found
  }

  startDrag(event: MouseEvent) {
    if ((event.target as HTMLElement).closest('.chat-panel')) return;

    this.isDragging = true;

    const startMouseX = event.clientX;
    const startMouseY = event.clientY;
    const startPosX = this.position.x;
    const startPosY = this.position.y;

    const move = (e: MouseEvent) => {
      if (!this.isDragging) return;

      const deltaX = startMouseX - e.clientX;
      const deltaY = startMouseY - e.clientY;

      this.position.x = Math.max(0, startPosX + deltaX);
      this.position.y = Math.max(0, startPosY + deltaY);
    };

    const stop = () => {
      this.isDragging = false;
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', stop);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stop);
  }

  send() {
    if (!this.input.trim()) return;

    const question = this.input;
    this.currentRequestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Add user message to display
    this.messages.push({
      type: 'user',
      user: question,
      timestamp: new Date()
    });

    // Set loading state
    this.isLoading = true;

    // Clear input
    this.input = "";

    // Call backend API with session_id
    const apiUrl = `${environment.apiUrl}/api/ai/chat`;
    const params: any = { message: question };

    // Include session_id if available
    if (this.sessionId) {
      params.sessionId = this.sessionId;
    }

    console.log(`[Widget] Sending request ${this.currentRequestId} with message:`, question, 'sessionId:', this.sessionId);

    this.http.post<any>(apiUrl, null, { params })
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          console.log(`[Widget] API Response for ${this.currentRequestId}:`, response);
          // Loading state will be set to false when WebSocket response arrives
          // If no WebSocket response after 30 seconds, clear loading
          setTimeout(() => {
            if (this.isLoading) {
              console.warn('[Widget] No WebSocket response received within 30 seconds');
              this.isLoading = false;
            }
          }, 30000);
        },
        (error) => {
          console.error(`[Widget] API Error for ${this.currentRequestId}:`, error);
          this.isLoading = false;
          this.messages.push({
            type: 'ai-text',
            aiText: `Error: ${error.message || 'Failed to get response from AI'}`,
            timestamp: new Date()
          });
        }
      );
  }

  // Handle image loading errors
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    console.error('[Widget] Image failed to load:', img.src);
    img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f0f0f0" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-size="12">Image Error</text></svg>';
  }

  // Open image modal
  openImageModal(imageUrl: string): void {
    console.log('[Widget] Opening image modal:', imageUrl);
    this.selectedImage = imageUrl;
  }

  // Close image modal
  closeImageModal(): void {
    console.log('[Widget] Closing image modal');
    this.selectedImage = null;
  }

  /**
   * Open new session confirmation dialog
   */
  openNewSessionDialog(): void {
    this.showNewSessionDialog = true;
    console.log('[Widget] Opened new session dialog');
  }

  /**
   * Cancel new session creation
   */
  cancelNewSession(): void {
    this.showNewSessionDialog = false;
    console.log('[Widget] Cancelled new session creation');
  }

  /**
   * Confirm and create a new session
   */
  confirmNewSession(): void {
    this.showNewSessionDialog = false;
    console.log('[Widget] Creating new session...');

    // Clear existing messages
    this.messages = [];
    this.input = "";

    // Create new session
    this.createAiSession();
  }

  protected readonly BASE_URL_UPLOAD = BASE_URL_UPLOAD;
}
