import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {SafeHtmlPipe} from '../../share/pipe/pipe-html.pipe';
import {
  AVATAR_DEFAULT,
  ICON_CLOSE, ICON_DOT_THREE, ICON_EMOTE, ICON_LIKE,
  ICON_MIC_MESSAGE,
  ICON_MINUS,
  ICON_PHONE,
  ICON_UPLOAD
} from '../../share/other/icons/icons';
import {CommonModule, NgForOf, NgIf, NgStyle} from '@angular/common';
import {TransferDataService} from '../../../service/tranfer-data/transfer-data.service';
import {LIST_EMOTE} from '../../../constants/constants';
import {FormsModule} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {EmoteModalComponent} from './emote-modal/emote-modal.component';
import {MessageService} from '../../../service/message/message.service';

@Component({
  selector: 'app-message-detail',
  standalone: true,
  imports: [
    SafeHtmlPipe,
    NgIf,
    NgForOf,
    NgStyle,
    FormsModule,
    CommonModule
  ],
  templateUrl: './message-detail.component.html',
  styleUrl: './message-detail.component.scss'
})
export class MessageDetailComponent implements OnInit{

  isLoaded = false;
  cols = 2;
  rows = 2;
  baseUrl:string = 'http://localhost:8080/uploads/'
  userCurrentId:any = 2;
  messageActive:any = null
  isShowListEmote:boolean = false
  isShowAction:boolean = false
  isUpdateMess:boolean = false
  emotes = LIST_EMOTE
  valueNewMessage:string = ''
  infoMessageDetail: any = [];
  @ViewChild('scrollContainer')
  private scrollContainer!: ElementRef;


  constructor(private transferData:TransferDataService,private modalService:NgbModal,private messageService:MessageService) {
  }

  ngOnInit(): void {
    this.getListMessage();

  }


  getListMessage(){
    this.messageService.gets("69a92296db900f6bea29cf7f").subscribe(async (res:any)=>{
      if (res.status === 200) {
        this.infoMessageDetail = res.data;
        this.isLoaded = true;
        this.infoMessageDetail.forEach((mess:any)=>{
          this.setLayout(mess);
        })
      }
    })

  }

  handleShowListEmote(idMess:any){
    this.isShowAction =false
    console.log(idMess)
    this.messageActive =
      this.messageActive = idMess;
    this.isShowListEmote = !this.isShowListEmote
  }

  handleShowRecallMess(idMess:any){
    this.isShowListEmote = false
    console.log(idMess)
    this.messageActive =
      this.messageActive = idMess;
    this.isShowAction = !this.isShowAction
  }

  handleChangeEmote(idMess:any,urlEmote:string){
    this.infoMessageDetail.forEach((value:any, index:any) => {
      if(value.id === idMess){
        value.emote = urlEmote
      }
    });
  }

  handleSendMessage(like?:boolean){

    if((this.valueNewMessage && !this.isUpdateMess) || like ){
      const newMessage = {
        id: Math.random(),
        conversationId: "c01",
        senderId: this.userCurrentId,
        content: like ? '' : this.valueNewMessage,
        like: like,
        emote: "",
        createdAt: "2026-03-03T10:05:00"
      }
      this.infoMessageDetail.push(newMessage)
      this.valueNewMessage = ''
      this.scrollToBottom()
    }else {
      this.infoMessageDetail.forEach((value:any, index:any) => {
        if(value.id === this.messageActive){
          value.content = this.valueNewMessage
          this.valueNewMessage = ''
        }
      });
    }

    // if((this.valueNewMessage && !this.isUpdateMess)


  }
  handleShowModal(mess:any){
    const modalRef = this.modalService.open(EmoteModalComponent,
      {
        size: 'sm',
        centered: true,
        backdrop: 'static'
      }
      );
    modalRef.componentInstance.messageInfo = mess;
    modalRef.result.then(
      (result) => {
        console.log('Closed with:', result);
      },
      (reason) => {
        if(reason){
          this.handleCancelEmote(reason)
        }
      }
    );
  }

  handleCancelEmote(messId:any){
    this.infoMessageDetail.forEach((value:any, index:any) => {
      if(value.id === messId){
        value.emote = ''
      }
    });
  }

  handleCloseMessage() {
    this.transferData.sendMessage(false)
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  handleReCallMess(idMess:any) {
    this.infoMessageDetail.forEach((value:any, index:any) => {
      if(value.id === idMess){
        value.content = ''
        value.emote = ''
      }
    });
  }

  handleRemoveMess(idMess:any) {
    this.infoMessageDetail.forEach((value:any, index:any) => {
      if(value.id === idMess){
        this.infoMessageDetail.splice(index,1)
      }
    });
  }

  handleUpdateMess(idMess:any) {
    this.infoMessageDetail.forEach((value:any, index:any) => {
      if(value.id === idMess){
        this.valueNewMessage = value.content
        this.isUpdateMess = true
      }
    });
  }


  setLayout(mess: any) {
    const files = mess?.messageDetail?.urlFiles || [];
    const count = files.length;

    let cols = 2;
    let rows = 2;

    if (count > 4) cols = 3;
    else if (count > 1) cols = 2;

    if (count > 6) rows = 3;
    else if (count > 3) rows = 2;

    mess.cols = cols;
    mess.rows = rows;
  }


  protected readonly AVATAR_DEFAULT = AVATAR_DEFAULT;
  protected readonly ICON_CLOSE = ICON_CLOSE;
  protected readonly ICON_PHONE = ICON_PHONE;
  protected readonly ICON_MINUS = ICON_MINUS;
  protected readonly ICON_MIC_MESSAGE = ICON_MIC_MESSAGE;
  protected readonly ICON_UPLOAD = ICON_UPLOAD;
  protected readonly ICON_LIKE = ICON_LIKE;
  protected readonly ICON_EMOTE = ICON_EMOTE;


  protected readonly ICON_DOT_THREE = ICON_DOT_THREE;



}
