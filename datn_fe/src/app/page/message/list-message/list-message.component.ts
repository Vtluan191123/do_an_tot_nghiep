import {Component, Output} from '@angular/core';
import {ICON_SEARCH} from '../../share/other/icons/icons';
import {SafeHtmlPipe} from '../../share/pipe/pipe-html.pipe';
import {MessageDetailComponent} from '../message-detail/message-detail.component';
import {NgIf} from '@angular/common';
import EventEmitter from 'node:events';
import {TransferDataService} from '../../../service/tranfer-data/transfer-data.service';

@Component({
  selector: 'app-list-message',
  standalone: true,
  imports: [
    SafeHtmlPipe,
    MessageDetailComponent,
    NgIf
  ],
  templateUrl: './list-message.component.html',
  styleUrl: './list-message.component.scss'
})
export class ListMessageComponent {
  isShowMessageDetail:boolean = false

  constructor(private transferDataService:TransferDataService) {
  }



  handleShowMessageDetail() {
    this.isShowMessageDetail = true
    this.transferDataService.sendMessage(true)
  }

  protected readonly ICON_SEARCH = ICON_SEARCH;
}
