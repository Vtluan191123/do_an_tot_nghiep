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

  private unreadMessageCountSubject = new BehaviorSubject<number>(0);
  unreadMessageCount$ = this.unreadMessageCountSubject.asObservable();

  private unreadGroupIds: Set<string | number> = new Set();

  setUnreadMessageCount(value: number) {
    this.unreadMessageCountSubject.next(value);
  }

  increaseUnreadMessageCount(groudId: string | number) {
    // Chỉ tăng nếu groudId này chưa có trong list
    if (!this.unreadGroupIds.has(groudId)) {
      console.log('Thêm groudId vào set:', groudId);
      this.unreadGroupIds.add(groudId);
      this.unreadMessageCountSubject.next(this.unreadMessageCountSubject.value + 1);
      console.log('Count tăng lên:', this.unreadMessageCountSubject.value, 'Set hiện tại:', Array.from(this.unreadGroupIds));
    } else {
      console.log('groudId đã có trong set, không tăng:', groudId);
    }
  }

  decreaseUnreadMessageCount(groudId?: string | number) {
    if (groudId !== undefined) {
      if (this.unreadGroupIds.has(groudId)) {
        // Nếu groudId có trong set, xóa nó
        console.log('Xóa groudId khỏi set:', groudId, 'Set hiện tại:', Array.from(this.unreadGroupIds));
        this.unreadGroupIds.delete(groudId);
        const current = this.unreadMessageCountSubject.value;
        if (current > 0) {
          this.unreadMessageCountSubject.next(current - 1);
          console.log('Count giảm xuống:', current - 1);
        }
      } else {
        // Nếu groudId không có trong set, nhưng vẫn giảm count
        // (có thể group này đã được đánh dấu đọc ở lần trước)
        const current = this.unreadMessageCountSubject.value;
        if (current > 0) {
          this.unreadMessageCountSubject.next(current - 1);
          console.log('⚠️ groudId không trong set nhưng vẫn giảm count:', groudId, 'Count:', current - 1);
        }
      }
    } else {
      // Nếu không pass groudId, giảm 1 từ count hiện tại
      const current = this.unreadMessageCountSubject.value;
      if (current > 0) {
        this.unreadMessageCountSubject.next(current - 1);
      }
    }
  }

  getUnreadGroupIds(): Set<string | number> {
    return this.unreadGroupIds;
  }

  resetUnreadGroups() {
    this.unreadGroupIds.clear();
    this.unreadMessageCountSubject.next(0);
  }

}
