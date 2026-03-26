import {Component, OnInit, Output} from '@angular/core';
import {ICON_SEARCH} from '../../share/other/icons/icons';
import {SafeHtmlPipe} from '../../share/pipe/pipe-html.pipe';
import {MessageDetailComponent} from '../message-detail/message-detail.component';
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import EventEmitter from 'node:events';
import {TransferDataService} from '../../../service/tranfer-data/transfer-data.service';
import {UserService} from '../../../service/user/user.service';
import {BASE_URL_UPLOAD} from '../../../constants/constants';

@Component({
  selector: 'app-list-message',
  standalone: true,
  imports: [
    SafeHtmlPipe,
    MessageDetailComponent,
    NgIf,
    NgForOf,
    NgStyle
  ],
  templateUrl: './list-message.component.html',
  styleUrl: './list-message.component.scss'
})
export class ListMessageComponent implements OnInit{
  isShowMessageDetail:boolean = false
  infoCurrentUser:any
  listGroud:any

  constructor(private transferDataService:TransferDataService,
              private userService:UserService) {
  }

  ngOnInit(): void {
        this.getInfoUser();
        this.getListGrouds()
    }

  getInfoUser(){
    this.transferDataService.infoUser$.subscribe((res:any)=>{
      this.infoCurrentUser = res
    })
  }

  getListGrouds(){
    this.userService.getListGroup(this.infoCurrentUser.id).subscribe((res:any)=>{
      if(res.status === 200) this.listGroud = res.data.userDetailGroudDto
    })
  }



  handleShowMessageDetail(groud:any) {
    this.isShowMessageDetail = true
    this.transferDataService.sendMessage(groud)
    debugger
  }

  protected readonly ICON_SEARCH = ICON_SEARCH;
  protected readonly BASE_URL_UPLOAD = BASE_URL_UPLOAD;
}
