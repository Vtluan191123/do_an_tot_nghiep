import {Component, AfterViewInit, Inject, PLATFORM_ID, OnInit, OnDestroy} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import {NgStyle, NgForOf, NgIf} from '@angular/common';
import {AVATAR_DEFAULT, ICON_MESSAGE} from '../share/other/icons/icons';
import {SafeHtmlPipe} from '../share/pipe/pipe-html.pipe';
import {ListMessageComponent} from '../message/list-message/list-message.component';
import {TransferDataService} from '../../service/tranfer-data/transfer-data.service';
import {NavComponent} from '../share/nav/nav.component';
import {FooterComponent} from '../share/footer/footer.component';
import {ComboService} from '../../service/combo/combo.service';
import {SubjectService} from '../../service/subject/subject.service';
import {Router} from '@angular/router';
import {Combo, ComboFilterRequest} from '../../model/combo.model';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {BASE_URL_UPLOAD} from '../../constants/constants';

@Component({
  selector: 'app-dash-board',
  standalone: true,
  templateUrl: './dash-board.component.html',
  imports: [
    CommonModule,
    NgStyle,
    NgForOf,
    NgIf,
    SafeHtmlPipe,
    ListMessageComponent,
    NavComponent,
    FooterComponent
  ],
  styleUrls: ['./dash-board.component.scss']
})
export class DashBoardComponent implements AfterViewInit, OnInit, OnDestroy {

  countMessage: any;

  // Combos
  combos: Combo[] = [];
  loadingCombos: boolean = true;
  errorCombos: string = '';

  // Subjects
  subjects: any[] = [];
  loadingSubjects: boolean = true;
  errorSubjects: string = '';

  // Drag properties
  isDragging: boolean = false;
  dragStartX: number = 0;
  dragStartScrollLeft: number = 0;
  scrollContainer: HTMLElement | null = null;

  // Cleanup
  private destroy$ = new Subject<void>();

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
              private transferDataService: TransferDataService,
              private comboService: ComboService,
              private subjectService: SubjectService,
              private router: Router) {}

  ngOnInit(): void {
    // get count mess
    this.transferDataService.countMess$.subscribe((res) => {
      this.countMessage = res;
    });

    // Load combos
    this.loadCombos();

    // Load subjects
    this.loadSubjects();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load combos from API
   */
  loadCombos(): void {
    const filter: ComboFilterRequest = {
      page: 0,
      size: 12,
      sortBy: 'id',
      sortDirection: 'desc'
    };

    this.comboService.getAllCombos(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response: any) => {
          if (response.status === 200) {
            this.combos = response.data;
            this.loadingCombos = false;
          } else {
            this.errorCombos = 'Lỗi khi tải danh sách gói';
            this.loadingCombos = false;
          }
        },
        (error) => {
          console.error('Error loading combos:', error);
          this.errorCombos = 'Không thể tải danh sách gói';
          this.loadingCombos = false;
        }
      );
  }

  /**
   * Load subjects from API
   */
  loadSubjects(): void {
    const filter = {
      page: 0,
      size: 6,
      sortBy: 'id',
      sortDirection: 'desc'
    };

    this.subjectService.getAllSubjects(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response: any) => {
          if (response.status === 200) {
            this.subjects = response.data;
            this.loadingSubjects = false;
          } else {
            this.errorSubjects = 'Lỗi khi tải danh sách môn học';
            this.loadingSubjects = false;
          }
        },
        (error) => {
          console.error('Error loading subjects:', error);
          this.errorSubjects = 'Không thể tải danh sách môn học';
          this.loadingSubjects = false;
        }
      );
  }

  /**
   * Navigate to combo detail
   */
  viewComboDetail(id: number): void {
    this.router.navigate(['/combo-detail', id]);
  }

  /**
   * Navigate to subject detail
   */
  viewSubjectDetail(id: number): void {
    // You can navigate to a subject detail page if available
    // For now, we can just open combo-detail or create a subject-detail page
    this.router.navigate(['/subject-detail', id]);
  }

  /**
   * Format price
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  // ...existing code...

  ngAfterViewInit(): void {
    this.initPreloader();
    this.initBackground();
    this.initMenu();
    this.initCarousel();
    this.initDragScroll();
  }

  /**
   * Initialize drag scroll for combos
   */
  initDragScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.scrollContainer = document.querySelector('.combos-scroll-container') as HTMLElement;

    if (!this.scrollContainer) return;

    this.scrollContainer.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.scrollContainer.addEventListener('mouseleave', () => this.onMouseLeave());
    this.scrollContainer.addEventListener('mouseup', () => this.onMouseUp());
    this.scrollContainer.addEventListener('mousemove', (e) => this.onMouseMove(e));
  }

  /**
   * Handle mouse down - start dragging
   */
  private onMouseDown(e: MouseEvent): void {
    this.isDragging = true;
    this.dragStartX = e.pageX - (this.scrollContainer?.offsetLeft || 0);
    this.dragStartScrollLeft = this.scrollContainer?.scrollLeft || 0;

    if (this.scrollContainer) {
      this.scrollContainer.style.cursor = 'grabbing';
      this.scrollContainer.style.userSelect = 'none';
    }
  }

  /**
   * Handle mouse up - stop dragging
   */
  private onMouseUp(): void {
    this.isDragging = false;
    if (this.scrollContainer) {
      this.scrollContainer.style.cursor = 'grab';
      this.scrollContainer.style.userSelect = 'auto';
    }
  }

  /**
   * Handle mouse leave - stop dragging
   */
  private onMouseLeave(): void {
    this.isDragging = false;
    if (this.scrollContainer) {
      this.scrollContainer.style.cursor = 'grab';
      this.scrollContainer.style.userSelect = 'auto';
    }
  }

  /**
   * Handle mouse move - drag scroll
   */
  private onMouseMove(e: MouseEvent): void {
    if (!this.isDragging || !this.scrollContainer) return;

    e.preventDefault();
    const x = e.pageX - (this.scrollContainer?.offsetLeft || 0);
    const walk = (x - this.dragStartX) * 1; // Multiply for faster/slower drag
    this.scrollContainer.scrollLeft = this.dragStartScrollLeft - walk;
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


  protected readonly BASE_URL_UPLOAD = BASE_URL_UPLOAD;
}
