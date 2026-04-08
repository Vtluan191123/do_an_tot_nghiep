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
  }

  startDrag(event: MouseEvent) {
    // chỉ drag khi click ngoài chat
    if ((event.target as HTMLElement).closest('.chat-panel')) return;

    this.isDragging = true;

    // Calculate offset from right and bottom edges
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.offsetX = event.clientX - (window.innerWidth - rect.right);
    this.offsetY = event.clientY - (window.innerHeight - rect.bottom);

    const move = (e: MouseEvent) => {
      if (!this.isDragging) return;

      // Calculate new right and bottom positions
      const newRight = window.innerWidth - e.clientX - this.offsetX;
      const newBottom = window.innerHeight - e.clientY - this.offsetY;

      this.position.x = Math.max(0, newRight);
      this.position.y = Math.max(0, newBottom);
    };

    const stop = () => {
      this.isDragging = false;
      window.removeEventListener('mousemove', move);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stop, { once: true });
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
