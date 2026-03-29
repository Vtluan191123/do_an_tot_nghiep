import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  standalone: true,
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements AfterViewInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    this.initBackground();
  }

  initBackground() {
    if (!isPlatformBrowser(this.platformId)) return;
    // Dùng native DOM API để set background
    setTimeout(() => {
      const elements = document.querySelectorAll('.set-bg');
      elements.forEach((el: any) => {
        const bg = el.getAttribute('data-setbg');
        if (bg) {
          el.style.backgroundImage = 'url(' + bg + ')';
        }
      });
    }, 500);
  }
}

