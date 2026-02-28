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
  position = { x: 20, y: 20 };

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

    this.offsetX = event.clientX - this.position.x;
    this.offsetY = event.clientY - this.position.y;

    const move = (e: MouseEvent) => {
      if (!this.isDragging) return;

      this.position.x = e.clientX - this.offsetX;
      this.position.y = e.clientY - this.offsetY;
    };

    const stop = () => {
      this.isDragging = false;
      window.removeEventListener('mousemove', move);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stop, { once: true });
  }

  send() {
    if (!this.input) return;

    this.messages.push("You: " + this.input);

    setTimeout(() => {
      this.messages.push("AI: I understand!");
    }, 500);

    this.input = "";
  }
}
