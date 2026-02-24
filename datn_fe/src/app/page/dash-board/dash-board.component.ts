import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {NgStyle} from '@angular/common';


declare var $: any;

@Component({
  selector: 'app-dash-board',
  standalone: true,
  templateUrl: './dash-board.component.html',
  imports: [
    NgStyle
  ],
  styleUrls: ['./dash-board.component.scss']
})
export class DashBoardComponent implements AfterViewInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  ngAfterViewInit(): void {
    this.initPreloader();
    this.initBackground();
    this.initMenu();
    this.initSearch();
    this.initCarousel();
  }

  /* Preloader */
  initPreloader() {
    window.addEventListener('load', () => {
      $('.loader').fadeOut();
      $('#preloder').delay(200).fadeOut('slow');
    });
  }

  /* Background image set */
  initBackground() {
    $('.set-bg').each(() => {
      const bg = $(this).data('setbg');
      $(this).css('background-image', 'url(' + bg + ')');
    });
  }

  /* Offcanvas menu */
  initMenu() {
    $('.canvas-open').on('click', () => {
      $('.offcanvas-menu-wrapper').addClass('show-offcanvas-menu-wrapper');
      $('.offcanvas-menu-overlay').addClass('active');
    });

    $('.canvas-close, .offcanvas-menu-overlay').on('click', () => {
      $('.offcanvas-menu-wrapper').removeClass('show-offcanvas-menu-wrapper');
      $('.offcanvas-menu-overlay').removeClass('active');
    });
  }

  /* Search modal */
  initSearch() {
    $('.search-switch').on('click', () => {
      $('.search-model').fadeIn(400);
    });

    $('.search-close-switch').on('click', () => {
      $('.search-model').fadeOut(400, () => {
        $('#search-input').val('');
      });
    });
  }

  /* Owl Carousel */
  initCarousel() {

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

  }

}
