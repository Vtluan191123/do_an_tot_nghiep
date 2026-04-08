import {Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, AfterViewChecked} from '@angular/core';
import {SafeHtmlPipe} from '../../share/pipe/pipe-html.pipe';
import {
  AVATAR_DEFAULT,
  ICON_CLOSE, ICON_CLOSE_AUDIO, ICON_DOT_THREE, ICON_EMOTE, ICON_LIKE,
  ICON_MIC_MESSAGE,
  ICON_MINUS, ICON_PAUSE,
  ICON_PHONE, ICON_PLAY, ICON_SEND,
  ICON_UPLOAD
} from '../../share/other/icons/icons';
import {CommonModule, NgForOf, NgIf, NgStyle} from '@angular/common';
import {TransferDataService} from '../../../service/tranfer-data/transfer-data.service';
import {BASE_TOPIC_SOCKET_FE, BASE_URL_UPLOAD, LIST_EMOTE, MESSAGE_TYPE} from '../../../constants/constants';
import {FormsModule} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {EmoteModalComponent} from './emote-modal/emote-modal.component';
import {MessageService} from '../../../service/message/message.service';
import {MessageRequest} from '../../../model/message';
import {WebsocketService} from '../../../service/socket/websocket.service';
import {ToastrService} from 'ngx-toastr';
import {Subject, takeUntil} from 'rxjs';
import {Title} from '@angular/platform-browser';
import {Route, Router} from '@angular/router';
import {VideoCallComponent} from '../../video-call/video-call.component';
import {SocketData} from '../../../model/socket';
import {FriendProfileModalComponent} from '../../friend-search/friend-profile-modal/friend-profile-modal.component';
import {Friend, FriendSearchService} from '../../../service/friend/friend-search.service';

@Component({
  selector: 'app-message-detail',
  standalone: true,
  imports: [
    SafeHtmlPipe,
    NgIf,
    NgForOf,
    NgStyle,
    FormsModule,
    CommonModule,
    FriendProfileModalComponent
  ],
  templateUrl: './message-detail.component.html',
  styleUrl: './message-detail.component.scss'
})
export class MessageDetailComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy{
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
  //thông tin bạn bè
  userDetailMessage:any
  @ViewChild('scrollContainer')
  private scrollContainer!: ElementRef;
  previewImages: string[] = [];
  previewVideos: string[] = [];
  isImage:boolean = false
  isVideo:boolean = false
  isMicro:boolean = false
  isPlayingMicro:boolean = false
  infoCurrentUser: any;
  totalSecondsDisplay: string = '00.00';
  timeMicro:any
  currentTime:number = 0

  //Profile modal
  selectedFriend: Friend | null = null;
  showProfileModal = false;

  mediaRecorder: MediaRecorder | null | undefined;
  audioChunks: Blob[] = [];
  audioUrl: string | null = null;
  audioBlob!: Blob;
  maxTimeAudio: any;
  audioMp3 = new Audio('assets/sounds/mp3_info_mess.mp3');

  private lastMessageCount = 0;

  constructor(
    private transferData:TransferDataService,
    private modalService:NgbModal,
    private messageService:MessageService,
    private webSocketService:WebsocketService,
    private toartService:ToastrService,
    private transferDataService:TransferDataService,
    private titleService: Title,
    private router:Router,
    private cdr: ChangeDetectorRef,
    private friendSearchService: FriendSearchService,
  ) {
  }



  ngOnInit(): void {
    this.getInfoUser()
    this.getGroudDetail()
    this.handleWebsocketListen();
  }

  ngAfterViewInit(): void {
    // Scroll to bottom sau khi view được khởi tạo
    this.scrollToBottom();
  }

  ngAfterViewChecked(): void {
    // Nếu số lượng tin nhắn thay đổi thì scroll xuống dưới cùng
    if (this.infoMessageDetail && this.infoMessageDetail.length !== this.lastMessageCount) {
      this.lastMessageCount = this.infoMessageDetail.length;
      this.scrollToBottom();
      this.cdr.detectChanges();
    }
  }

  // Hàm scroll đến cuối cùng của container
  private scrollToBottom(): void {
    try {
      // Sử dụng setTimeout để đảm bảo DOM đã được update
      setTimeout(() => {
        if (this.scrollContainer && this.scrollContainer.nativeElement) {
          const element = this.scrollContainer.nativeElement;
          element.scrollTop = element.scrollHeight;
        }
      }, 0);
    } catch (err) {
      console.error('Lỗi khi scroll:', err);
    }
  }


  handleCountMicro(){
    this.timeMicro = setInterval(() => {

      const minutes = Math.floor(this.currentTime / 60);
      const seconds = this.currentTime % 60;

      this.totalSecondsDisplay =
        minutes.toString().padStart(2, '0') + "." +
        seconds.toString().padStart(2, '0');

      this.currentTime++;

    }, 1000);
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
        // Scroll to bottom sau khi load tin nhắn xong
        this.scrollToBottom();
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
        // Scroll to bottom sau khi gửi tin nhắn
        this.scrollToBottom();
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
      // Scroll to bottom sau khi update tin nhắn
      this.scrollToBottom();
    });
  }

  resetDataMessage(){
    this.valueNewMessage = ''
    this.selectedFiles = []
    this.previewImages = []
    this.previewVideos = []
    this.isUpdateMess = false
    this.isMicro = false
  }

  @ViewChild('fileInput') fileInput!: ElementRef;
  onFileSelected($event: any) {
    const files: FileList = $event.target.files;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.handleFiles(file)
      // const reader = new FileReader();
      // reader.onload = (e: any) => {
      //   this.previewImages.push(e.target.result);
      //   console.log(e.target.result)
      // };
      // reader.readAsDataURL(file);
    }
    this.fileInput.nativeElement.value = [];
  }

  handleFiles(file: any) {

    if (
      !file.type.startsWith('image') &&
      !file.type.startsWith('video') &&
      !file.type.startsWith('audio')
    ) {
      this.toartService.error("File không hợp lệ: " + file.type, 'Thông báo');
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 50) {
      this.toartService.error("File không vượt quá: 50M", 'Thông báo');
      return;
    }

    if (file.type.startsWith('image')) {

      this.isImage = true;
      this.isVideo = false;

      this.previewImages.push(URL.createObjectURL(file));

    }
    if (file.type.startsWith('video')) {

      this.isImage = false;
      this.isVideo = true;

      this.previewVideos.push(URL.createObjectURL(file));

    }

    this.selectedFiles.push(file);
  }

  openImage(img: string,blog:boolean) {
    if(blog)
    window.open(img, '_blank');
    else window.open(BASE_URL_UPLOAD  + img, '_blank');
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

  openProfileModal(): void {
    if (!this.userDetailMessage) return;

    // Create Friend object from userDetailMessage
    const friend: Friend = {
      id: this.userDetailMessage.id || '',
      name: this.userDetailMessage.username || '',
      username: this.userDetailMessage.username || '',
      avatar: this.userDetailMessage.imagesUrl ? BASE_URL_UPLOAD + this.userDetailMessage.imagesUrl : BASE_URL_UPLOAD + 'default_avt.png',
      isOnline: true, // You can update this based on actual status
    };

    this.selectedFriend = friend;
    this.showProfileModal = true;

    // Load detailed profile information
    this.friendSearchService.getFriendProfile(friend.id).subscribe(
      (profile) => {
        if (this.selectedFriend) {
          this.selectedFriend = { ...this.selectedFriend, ...profile };
        }
      },
      (error) => {
        console.error('Lỗi tải thông tin bạn bè:', error);
      }
    );
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
    this.selectedFriend = null;
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
          // Scroll to bottom khi có tin nhắn mới
          this.scrollToBottom();

        } catch (e) {
          const index = this.infoMessageDetail.findIndex(
            (m:any) => m.id === result
          );
          this.infoMessageDetail.splice(index,1)
        }
      }
    })
  }
  @ViewChild('audio') audio!: ElementRef<HTMLAudioElement>;
  handleMicro() {
    this.isMicro = !this.isMicro
    this.isPlayingMicro = !this.isPlayingMicro

    //nếu có file tạm reset để tạo file mới
    if(this.audioUrl){
      this.audioUrl = null
      this.totalSecondsDisplay = '00.00';
      this.isPlayingMicro = false
      this.maxTimeAudio = 0
      this.currentTime = 0
      if (this.mediaRecorder) {

        // dừng ghi âm
        if (this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
        }

        // tắt microphone
        const tracks = this.mediaRecorder.stream.getTracks();
        tracks.forEach(track => track.stop());

        // xoá recorder
        this.mediaRecorder = null;
      }
    }else {
      this.handleCountMicro()
      this.startRecord()
    }
  }


  handlePlayPauseMicro() {
    this.isPlayingMicro = !this.isPlayingMicro
    clearInterval(this.timeMicro)
    //dừng ghi âm
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.stopRecord()
    }else {
      const audio = this.audio.nativeElement;

      if (audio.paused) {
        this.totalSecondsDisplay = '00.00';
        audio.play();
        audio.ontimeupdate = () => {

          this.currentTime = Math.floor(audio.currentTime);
          const minutes = Math.floor(this.currentTime / 60);
          const seconds = this.currentTime % 60;

          this.totalSecondsDisplay =
            minutes.toString().padStart(2, '0') + "." +
            seconds.toString().padStart(2, '0');
          console.log("Current second:", this.currentTime);
          if(this.currentTime >= this.maxTimeAudio){
            this.isPlayingMicro = false;
          }

        };
        console.log('dang phat')
        this.isPlayingMicro = true;
      } else {
        audio.pause();
        console.log('dung phat')
        this.isPlayingMicro = false;
      }
    }
  }


  async startRecord() {

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    this.mediaRecorder = new MediaRecorder(stream);

    // nhận dữ liệu audio
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    //listen khi dừng
    this.mediaRecorder.onstop = () => {

      const audio = this.audio.nativeElement;

      //tạo 1 file audio vào trong ram
      this.audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
      const fileName = "audio_" + Date.now() + ".webm";

      const audioFile = new File([this.audioBlob], fileName, {
        type: "audio/webm"
      });
      this.handleFiles(audioFile)

      this.audioUrl = URL.createObjectURL(this.audioBlob);

      // gán src cho audio
      //audio.src = this.audioUrl;

      //reset
      this.audioChunks = [];

      // chờ metadata load
      audio.onloadedmetadata = () => {
        this.maxTimeAudio =Math.floor(audio.duration);
        console.log("Audio duration:", this.maxTimeAudio);
      };

    };

    this.mediaRecorder.start();
  }

  stopRecord() {
    if(this.mediaRecorder)
      this.mediaRecorder.stop();
  }

  //chuông thông báo
  playMessageSound() {
    if (!this.audioMp3.paused) {
      this.audioMp3.currentTime = 0;
    } else {
      this.audioMp3.play().catch(() => {});
    }
  }


  handleCall() {
    const modalRef = this.modalService.open(VideoCallComponent, {
      size: 'xl',
      fullscreen: 'xxl',
      backdrop: "static",
      centered: true,
      windowClass: 'video-call-modal'
    });

    console.log('this.userDetailMessage',this.userDetailMessage)
    const data: SocketData = {
      type: 'call',
      metadata: {
        groupId: this.userDetailMessage.groudId,
        infoCaller: this.infoCurrentUser
      }
    }

    //bắn socket sang bên gọi
    this.webSocketService.sendMessage(`${BASE_TOPIC_SOCKET_FE}global/${this.userDetailMessage.id}`,
      data
    );
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


  protected readonly ICON_SEND = ICON_SEND;
  protected readonly ICON_PAUSE = ICON_PAUSE;


  protected readonly ICON_PLAY = ICON_PLAY;


  protected readonly ICON_CLOSE_AUDIO = ICON_CLOSE_AUDIO;


}
