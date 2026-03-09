import {Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
import {BASE_URL_UPLOAD, LIST_EMOTE, MESSAGE_TYPE} from '../../../constants/constants';
import {FormsModule} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {EmoteModalComponent} from './emote-modal/emote-modal.component';
import {MessageService} from '../../../service/message/message.service';
import {MessageRequest} from '../../../model/message';
import {WebsocketService} from '../../../service/socket/websocket.service';
import {ToastrService} from 'ngx-toastr';
import {Subject, takeUntil} from 'rxjs';
import {Title} from '@angular/platform-browser';

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
export class MessageDetailComponent implements OnInit,OnDestroy{
  private destroy$ = new Subject<void>();
  isLoaded = false;
  cols = 2;
  rows = 2;
  baseUrl:string = BASE_URL_UPLOAD
  messageActive:any = null
  isShowListEmote:boolean = false
  isShowAction:boolean = false
  isUpdateMess:boolean = false
  emotes = LIST_EMOTE
  valueNewMessage:string = ''
  infoMessageDetail: any = [];
  selectedFiles:any[] = [];
  messageCurrent:any
  userDetailMessage:any
  @ViewChild('scrollContainer')
  private scrollContainer!: ElementRef;
  previewImages: string[] = [];
  previewVideos: string[] = [];
  isImage:boolean = false
  isVideo:boolean = false
  infoCurrentUser: any;

  constructor(private transferData:TransferDataService,
              private modalService:NgbModal,
              private messageService:MessageService,
              private webSocketService:WebsocketService,
              private toartService:ToastrService,
              private transferDataService:TransferDataService,
              private titleService: Title) {
  }



  ngOnInit(): void {
    this.getInfoUser()
    this.getGroudDetail()
    this.handleWebsocketListen();
  }

  getInfoUser(){
    this.transferDataService.infoUser$.subscribe((res:any)=>{
      console.log('this.infoCurrentUser',res)
      this.infoCurrentUser = res
    })
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      if(this.selectedFiles.length > 0){
        this.handleSendMessage();
      }
    }
  }

  getGroudDetail(){
    this.transferData.userDetailGroud$
      .pipe(takeUntil(this.destroy$))
      .subscribe((res:any)=>{
      console.log('res',res)
      this.userDetailMessage = res
      this.getListMessage(this.userDetailMessage?.groudId);
    })
  }



  getListMessage(groudId:string){
    if(!groudId) return
    this.messageService.gets(groudId).subscribe(async (res:any)=>{
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
    this.messageActive =
      this.messageActive = idMess;
    this.isShowListEmote = !this.isShowListEmote
  }

  handleShowRecallMess(idMess:any){
    this.isShowListEmote = false
    this.messageActive =
      this.messageActive = idMess;
    this.isShowAction = !this.isShowAction
  }


  handleSendMessage(type?: any, icon?: string) {
    if(!this.valueNewMessage && !icon && !this.selectedFiles.length) return

    const message: MessageRequest = {
      groudId: this.userDetailMessage?.groudId,
      senderId: this.infoCurrentUser.id,
      messageDetailRequest: {
        type: type ? type : this.isImage ? 'image' : 'video',
        content: type === MESSAGE_TYPE.TEXT ? this.valueNewMessage : icon, //icon là svg
        emote: null
      },
      isHide: false
    };
    this.messageService.send(message, this.selectedFiles).subscribe((res:any)=>{
      if(res.status === 200){
        this.resetDataMessage()
      }
    });
  }

  handleRemoveMess(idMess:any) {
    this.messageService.delete(idMess).subscribe((res:any)=>{
      if(res.status === 200){
        this.toartService.success(res.message,'Thành công');
      }else {
        this.toartService.error(res.message,'Có lỗi');
      }
    })
  }

  handleChangeInput(idMess:string){
    this.isUpdateMess = true
    this.messageCurrent = this.infoMessageDetail.find((mess:any) => mess.id === idMess);
    this.valueNewMessage = this.messageCurrent.messageDetail.content
  }

  handleUpdateMess(idMess:any,emote?:string,isHide:boolean = false) {

    const message: MessageRequest = {
      messageId:idMess,
      groudId: this.userDetailMessage?.groudId,
      senderId: 1,
      messageDetailRequest: {
        type: MESSAGE_TYPE.TEXT,
        content: this.valueNewMessage, //icon là svg
        emote: emote
      },
      isHide:isHide
    };

    this.messageService.update(message).subscribe((res:any)=>{
      this.resetDataMessage()
    });
  }

  resetDataMessage(){
    this.valueNewMessage = ''
    this.selectedFiles = []
    this.previewImages = []
    this.previewVideos = []
    this.isUpdateMess = false
  }

  @ViewChild('fileInput') fileInput!: ElementRef;
  onFileSelected($event: any) {
    const files: FileList = $event.target.files;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image') && !file.type.startsWith('video')) {
        this.toartService.error("File không hợp lệ: " + file.type, 'Thông báo' );
        return;
      }
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 50) {
        this.toartService.error("File không vượt quá: 50M", 'Thông báo' );
        return;
      }



      if(file.type.startsWith('image')){
        this.isImage = true
        this.isVideo = false
        this.previewImages.push(URL.createObjectURL(file));
      }else{
        this.isImage =false
        this.isVideo =true
        this.previewVideos.push(URL.createObjectURL(file));
      }
      this.selectedFiles.push(file);


      // const reader = new FileReader();
      // reader.onload = (e: any) => {
      //   this.previewImages.push(e.target.result);
      //   console.log(e.target.result)
      // };
      // reader.readAsDataURL(file);
    }
    this.fileInput.nativeElement.value = [];
  }

  openImage(img: string,blog:boolean) {
    if(blog)
    window.open(img, '_blank');
    else window.open("http://localhost:8080/uploads/" + img, '_blank');
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewImages.splice(index, 1);
    this.previewVideos.splice(index, 1);
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
      },
      (reason) => {
        if(reason){
          this.handleUpdateMess(mess.id,'',)
        }
      }
    );
  }


  handleCloseMessage() {
    this.transferData.sendMessage(undefined)
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

  handleWebsocketListen(){
    this.webSocketService.subscribeToTopic(`/topics/groudId:${this.userDetailMessage?.groudId}`).subscribe((res:any)=>{
      console.log('result websocket',res)
      this.titleService.setTitle("Vtluan abc")
      let result: any = res.body;
      // kiểm tra nếu là string thì parse
      if (typeof result === 'string') {
        try {
          result = JSON.parse(result);
          const index = this.infoMessageDetail.findIndex(
            (m:any) => m.id === result.id
          );
          if(index !== -1){
            this.infoMessageDetail[index] = result;
          }else{
            this.infoMessageDetail.push(result);
            if(this.infoCurrentUser.id !== result.senderId){
              this.transferDataService.sendToastMessage(this.userDetailMessage.username)
              this.playMessageSound()
            }
          }

        } catch (e) {
          const index = this.infoMessageDetail.findIndex(
            (m:any) => m.id === result
          );
          this.infoMessageDetail.splice(index,1)
        }
      }
    })
  }

  playMessageSound() {
    const audio = new Audio();
    audio.src = 'assets/sounds/mp3_info_mess.mp3';
    audio.load();
    audio.play();
  }



  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
  protected readonly MESSAGE_TYPE = MESSAGE_TYPE;
  protected readonly BASE_URL_UPLOAD = BASE_URL_UPLOAD;
}
