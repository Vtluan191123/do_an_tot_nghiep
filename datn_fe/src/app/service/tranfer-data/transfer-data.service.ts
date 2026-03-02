import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransferDataService {


  private showMessageDetail = new BehaviorSubject<boolean>(false);

  showMessageDetail$ = this.showMessageDetail.asObservable();

  sendMessage(msg: boolean) {
    this.showMessageDetail.next(msg);
  }

  constructor() { }
}
