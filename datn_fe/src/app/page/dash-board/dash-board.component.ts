import {Component, AfterViewInit, Inject, PLATFORM_ID, OnInit} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {NgStyle} from '@angular/common';
import {AVATAR_DEFAULT, ICON_MESSAGE} from '../share/other/icons/icons';
import {SafeHtmlPipe} from '../share/pipe/pipe-html.pipe';
import {ListMessageComponent} from '../message/list-message/list-message.component';
import {TransferDataService} from '../../service/tranfer-data/transfer-data.service';
import {NavComponent} from '../share/nav/nav.component';
import {FooterComponent} from '../share/footer/footer.component';

@Component({
  selector: 'app-dash-board',
  standalone: true,
  templateUrl: './dash-board.component.html',
  imports: [
    NgStyle,
    SafeHtmlPipe,
    ListMessageComponent,
    NavComponent,
    FooterComponent
  ],
  styleUrls: ['./dash-board.component.scss']
})
export class DashBoardComponent implements AfterViewInit,OnInit {


  countMessage:any

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
              private transferDataService:TransferDataService) {}

  ngOnInit(): void {
    //get count mess
    this.transferDataService.countMess$.subscribe((res)=>{
      this.countMessage = res
    })
  }
  ngAfterViewInit(): void {
    this.initPreloader();
    this.initBackground();
    this.initMenu();
    this.initCarousel();
  }

  /* Preloader */
  initPreloader() {
    if (!isPlatformBrowser(this.platformId)) return;

    const loader = document.querySelector('.loader') as HTMLElement;
    const preloder = document.getElementById('preloder') as HTMLElement;

    if (loader) {
      loader.style.transition = 'opacity 0.3s ease';
      loader.style.opacity = '0';
      loader.style.pointerEvents = 'none';
    }

    if (preloder) {
      setTimeout(() => {
        preloder.style.transition = 'opacity 0.5s ease';
        preloder.style.opacity = '0';
        preloder.style.pointerEvents = 'none';
        setTimeout(() => {
          preloder.style.display = 'none';
        }, 500);
      }, 200);
    }
  }

  /* Background image set */
  initBackground() {
    if (!isPlatformBrowser(this.platformId)) return;

    const elements = document.querySelectorAll('.set-bg');
    elements.forEach((el: any) => {
      const bg = el.getAttribute('data-setbg');
      if (bg) {
        el.style.backgroundImage = 'url(' + bg + ')';
      }
    });
  }

  /* Offcanvas menu */
  initMenu() {
    if (!isPlatformBrowser(this.platformId)) return;

    const canvasOpen = document.querySelector('.canvas-open') as HTMLElement;
    const canvasClose = document.querySelector('.canvas-close') as HTMLElement;
    const offcanvasWrapper = document.querySelector('.offcanvas-menu-wrapper') as HTMLElement;
    const offcanvasOverlay = document.querySelector('.offcanvas-menu-overlay') as HTMLElement;

    if (canvasOpen) {
      canvasOpen.addEventListener('click', () => {
        if (offcanvasWrapper) {
          offcanvasWrapper.classList.add('show-offcanvas-menu-wrapper');
        }
        if (offcanvasOverlay) {
          offcanvasOverlay.classList.add('active');
        }
      });
    }

    if (canvasClose) {
      canvasClose.addEventListener('click', () => {
        if (offcanvasWrapper) {
          offcanvasWrapper.classList.remove('show-offcanvas-menu-wrapper');
        }
        if (offcanvasOverlay) {
          offcanvasOverlay.classList.remove('active');
        }
      });
    }

    if (offcanvasOverlay) {
      offcanvasOverlay.addEventListener('click', () => {
        if (offcanvasWrapper) {
          offcanvasWrapper.classList.remove('show-offcanvas-menu-wrapper');
        }
        offcanvasOverlay.classList.remove('active');
      });
    }
  }
  /* Owl Carousel */
  initCarousel() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Kiểm tra nếu jQuery và owlCarousel có sẵn
    const $ = (window as any).$;
    if (!$ || !$.fn || !$.fn.owlCarousel) {
      console.warn('jQuery hoặc Owl Carousel chưa được load');
      return;
    }

    try {
      $('.hs-slider').owlCarousel({
        loop: true,
        margin: 0,
        nav: true,
        items: 1,
        dots: false,
        animateOut: 'fadeOut',
        animateIn: 'fadeIn',
        navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
        smartSpeed: 1200,
        autoplay: false
      });

      $('.ts-slider').owlCarousel({
        loop: true,
        items: 3,
        dots: true,
        autoplay: true,
        responsive: {
          320: { items: 1 },
          768: { items: 2 },
          992: { items: 3 }
        }
      });

      $('.ts_slider').owlCarousel({
        loop: true,
        items: 1,
        nav: true,
        autoplay: true
      });
    } catch (error) {
      console.warn('Lỗi khi khởi tạo Owl Carousel:', error);
    }
  }



  protected readonly ICON_MESSAGE = ICON_MESSAGE;
  protected readonly AVATAR_DEFAULT = AVATAR_DEFAULT;


}
