import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransferDataService {
  constructor() { }

  private showMessageDetail = new BehaviorSubject<boolean>(false);
  showMessageDetail$ = this.showMessageDetail.asObservable();

  private infoUser = new BehaviorSubject<any>(undefined);
  infoUser$ = this.infoUser.asObservable();

  sendMessage(msg: boolean) {
    this.showMessageDetail.next(msg);
  }

  sendInfoUser(info: any) {
    this.infoUser.next(info);
  }


}
