import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-widget',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf
  ],
  templateUrl: './widget.component.html',
  styleUrl: './widget.component.scss'
})
export class WidgetComponent {
  position = { x: 20, y: 20 };  // x = right offset, y = bottom offset

  isDragging = false;
  offsetX = 0;
  offsetY = 0;

  isOpen = false;
  messages: string[] = [];
  input = "";

  toggle(event: MouseEvent) {
    event.stopPropagation(); // tránh click bị drag
    this.isOpen = !this.isOpen;

    // Reset position when closing modal
    if (!this.isOpen) {
      this.position = { x: 20, y: 20 };
    }
  }

  startDrag(event: MouseEvent) {
    // chỉ drag khi click ngoài chat
    if ((event.target as HTMLElement).closest('.chat-panel')) return;

    this.isDragging = true;

    // Store the initial mouse position and widget position
    const startMouseX = event.clientX;
    const startMouseY = event.clientY;
    const startPosX = this.position.x;
    const startPosY = this.position.y;

    const move = (e: MouseEvent) => {
      if (!this.isDragging) return;

      // Calculate delta from start position
      const deltaX = startMouseX - e.clientX;
      const deltaY = startMouseY - e.clientY;

      // Update position based on delta
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

    this.messages.push("You: " + this.input);

    setTimeout(() => {
      this.messages.push("AI: Đây là một phản hồi tự động từ AI 🤖");
    }, 500);

    this.input = "";
  }
}
