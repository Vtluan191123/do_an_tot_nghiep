import { Component } from '@angular/core';
import {SafeHtmlPipe} from '../../../share/pipe/pipe-html.pipe';
import {ICON_CLOSE, ICON_PHONE} from '../../../share/other/icons/icons';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-emote-modal',
  standalone: true,
  imports: [
    SafeHtmlPipe
  ],
  templateUrl: './emote-modal.component.html',
  styleUrl: './emote-modal.component.scss'
})
export class EmoteModalComponent {
  messageInfo:any

  constructor(public activeModal: NgbActiveModal ) {
  }

  close() {
    this.activeModal.close('ok');
  }

  dismiss(idMess:any) {
    this.activeModal.dismiss(idMess);
  }
  protected readonly ICON_PHONE = ICON_PHONE;
  protected readonly ICON_CLOSE = ICON_CLOSE;
}
