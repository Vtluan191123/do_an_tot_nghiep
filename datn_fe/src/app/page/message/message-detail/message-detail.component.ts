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
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import {TransferDataService} from '../../../service/tranfer-data/transfer-data.service';
import {LIST_EMOTE} from '../../../constants/constants';
import {FormsModule} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {EmoteModalComponent} from './emote-modal/emote-modal.component';

@Component({
  selector: 'app-message-detail',
  standalone: true,
  imports: [
    SafeHtmlPipe,
    NgIf,
    NgForOf,
    NgStyle,
    FormsModule
  ],
  templateUrl: './message-detail.component.html',
  styleUrl: './message-detail.component.scss'
})
export class MessageDetailComponent implements OnInit{

  userCurrentId:any = "u01";
  messageActive:any = null
  isShowListEmote:boolean = false
  isShowAction:boolean = false
  isUpdateMess:boolean = false
  emotes = LIST_EMOTE
  valueNewMessage:string = ''
  infoMess: any = [
    {
      id: "m001",
      conversationId: "c01",
      senderId: "u01",
      content: "Xin chào 👋",
      emote: "",
      createdAt: "2026-03-03T10:00:00"
    },
    {
      id: "m002",
      conversationId: "c01",
      senderId: "u02",
      content: "Chào bạn nha 😄",
      like: false,
      emote: "https://static.xx.fbcdn.net/images/emoji.php/v9/tb6/1/32/1f44d.png",
      createdAt: "2026-03-03T10:01:00"
    },
    {
      id: "m003",
      conversationId: "c01",
      senderId: "u01",
      content: "Hôm nay bạn thế nào?",
      like: false,
      emote: "",
      createdAt: "2026-03-03T10:02:00"
    },
    {
      id: "m004",
      conversationId: "c01",
      senderId: "u02",
      content: "Mình ổn, đang làm việc đây 💻",
      like: false,
      emote: "",
      createdAt: "2026-03-03T10:03:00"
    },
    {
      id: "m005",
      conversationId: "c01",
      senderId: "u01",
      content: "Cuối tuần đi cafe không?",
      like: false,
      emote: "https://static.xx.fbcdn.net/images/emoji.php/v9/t72/1/32/2764.png",
      createdAt: "2026-03-03T10:04:00"
    },
    {
      id: "m006",
      conversationId: "c01",
      senderId: "u02",
      content: "Nghe hợp lý đó ☕",
      like: true,
      emote: "",
      createdAt: "2026-03-03T10:05:00"
    },
    {
      id: "m007",
      conversationId: "c01",
      senderId: "u01",
      content: "",
      like: false,
      emote: "",
      createdAt: "2026-03-03T10:06:00"
    },
    {
      id: "m008",
      conversationId: "c01",
      senderId: "u02",
      content: "👍 Đồng ý luôn",
      like: false,
      emote: "https://static.xx.fbcdn.net/images/emoji.php/v9/tb6/1/32/1f44d.png",
      createdAt: "2026-03-03T10:07:00"
    }
  ];
  @ViewChild('scrollContainer')
  private scrollContainer!: ElementRef;


  constructor(private transferData:TransferDataService,private modalService:NgbModal) {
  }

  ngOnInit(): void {
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
    this.infoMess.forEach((value:any, index:any) => {
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
      this.infoMess.push(newMessage)
      this.valueNewMessage = ''
      this.scrollToBottom()
    }else {
      this.infoMess.forEach((value:any, index:any) => {
        if(value.id === this.messageActive){
          value.content = this.valueNewMessage
          this.valueNewMessage = ''
        }
      });
    }
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
    this.infoMess.forEach((value:any, index:any) => {
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
    this.infoMess.forEach((value:any, index:any) => {
      if(value.id === idMess){
        value.content = ''
        value.emote = ''
      }
    });
  }

  handleRemoveMess(idMess:any) {
    this.infoMess.forEach((value:any, index:any) => {
      if(value.id === idMess){
        this.infoMess.splice(index,1)
      }
    });
  }

  handleUpdateMess(idMess:any) {
    this.infoMess.forEach((value:any, index:any) => {
      if(value.id === idMess){
        this.valueNewMessage = value.content
        this.isUpdateMess = true
      }
    });

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
