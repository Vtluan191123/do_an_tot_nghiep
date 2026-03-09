import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransferDataService {
  constructor() { }

  private userDetailGroud = new BehaviorSubject<any>(undefined);
  userDetailGroud$ = this.userDetailGroud.asObservable();

  private infoUser = new BehaviorSubject<any>(undefined);
  infoUser$ = this.infoUser.asObservable();

  sendMessage(msg: any) {
    this.userDetailGroud.next(msg);
  }

  sendInfoUser(info: any) {
    this.infoUser.next(info);
  }

  private countMess = new BehaviorSubject<number>(0);
  countMess$ = this.countMess.asObservable();

  setCountMess(value: number) {
    this.countMess.next(value);
  }

  increaseCountMess() {
    this.countMess.next(this.countMess.value + 1);
  }

  decreaseCountMess() {
    this.countMess.next(this.countMess.value - 1);
  }


  private receiverMess = new BehaviorSubject<any>(undefined);
  receiverMess$ = this.receiverMess.asObservable();

  sendToastMessage(msg: any) {
    this.receiverMess.next(msg);
  }


}
