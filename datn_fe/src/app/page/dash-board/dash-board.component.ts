import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {NgStyle} from '@angular/common';
import {AVATAR_DEFAULT, ICON_MESSAGE} from '../share/other/icons/icons';
import {SafeHtmlPipe} from '../share/pipe/pipe-html.pipe';
import {ListMessageComponent} from '../message/list-message/list-message.component';


declare var $: any;

@Component({
  selector: 'app-dash-board',
  standalone: true,
  templateUrl: './dash-board.component.html',
  imports: [
    NgStyle,
    SafeHtmlPipe,
    ListMessageComponent
  ],
  styleUrls: ['./dash-board.component.scss']
})
export class DashBoardComponent implements AfterViewInit {

  isShowListMessage: boolean = false


  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  ngAfterViewInit(): void {
    this.initPreloader();
    this.initBackground();
    this.initMenu();
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

  showListMessage() {
    this.isShowListMessage = !this.isShowListMessage
  }

  protected readonly ICON_MESSAGE = ICON_MESSAGE;
  protected readonly AVATAR_DEFAULT = AVATAR_DEFAULT;


}
