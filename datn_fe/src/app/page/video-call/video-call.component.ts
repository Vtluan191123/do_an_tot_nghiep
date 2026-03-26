import {Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild} from '@angular/core';
import {WebsocketService} from '../../service/socket/websocket.service';
import {isPlatformBrowser, NgForOf, NgIf, NgStyle} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
  CAMERA_CLOSE,
  CAMERA_OPEN,
  ICON_ARROW_LEFT,
  ICON_ARROW_RIGHT, ICON_CALL_AGAIN, ICON_EDIT_SQUARE,
  ICON_PHONE, ICON_THREE_DOT,
  MICRO_CLOSE, MICRO_OPEN, VIEW_CHANGE
} from '../share/other/icons/icons';
import {AuthServiceService} from '../../service/auth/auth-service.service';
import {getInfoCurrentUser} from '../../common/function_util';
import {TransferDataService} from '../../service/tranfer-data/transfer-data.service';
import {SafeHtmlPipe} from '../share/pipe/pipe-html.pipe';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {BASE_TOPIC_SOCKET, BASE_URL_UPLOAD} from '../../constants/constants';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgForOf,
    SafeHtmlPipe,
    NgStyle
  ],
  templateUrl: './video-call.component.html',
  styleUrl: './video-call.component.scss'
})
export class VideoCallComponent implements OnInit{
  isShowChangeDevice:boolean = false
  fromStream:any
  toStream:any
  pc:any
  hasCall:boolean = false
  topic:string = '/topics/user/'
  signaling = new BroadcastChannel('webrtc');
  // private pendingCandidates: RTCIceCandidateInit[] = [];
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;
  userSendId:any
  userReceiveId:any
  isOpenScreenUserCurrent:boolean = true

  //=====================
  @ViewChild('video', { static: true })
  videoElement!: ElementRef<HTMLVideoElement>;

  audioInputs: MediaDeviceInfo[] = [];
  audioOutputs: MediaDeviceInfo[] = [];
  videoInputs: MediaDeviceInfo[] = [];

  //status
  receiverCall:any
  isHideReceiverCall:boolean = true
  metadataCall:any

  //thiết bị lua chọn
  audioInput?: string;
  audioOutput?: string;
  videoInput?: string;

  //bật tắt mic và camera
  isEnableMic: boolean = true
  isEnableCamera: boolean = true

  //thiết bị hiện tại
  private stream?: MediaStream;
  private audioInputCurrent?: string;
  private videoInputCurrent?: string;
  private audioOutputCurrent?: string;
  hasPermission = false;
  infoCurrentUser:any
  infoFriendUser:any
  audioMp3 = new Audio('assets/sounds/call_mp3.mp3');

  constructor(private websocketService:WebsocketService,@Inject(PLATFORM_ID) private platformId: Object,
              private authService:AuthServiceService,
              private transferDataService:TransferDataService,
              public activeModal: NgbActiveModal) {
  }

  async ngOnInit(): Promise<void> {
    if(!this.isBrowser()) return
    if (!isPlatformBrowser(this.platformId)) return;
    await this.init()
  }

  async init(){
    this.infoCurrentUser = await getInfoCurrentUser(
      this.authService.getInfoUser()
    );

      // lấy khi mở message detail
    this.transferDataService.userDetailGroud$.subscribe(user => {
      if (!user) return;
      this.infoFriendUser = user;
    });

    if(!this.infoFriendUser){
      this.infoFriendUser = this.metadataCall.infoCaller
    }

    this.userSendId = this.infoCurrentUser.id;
    this.userReceiveId = this.infoFriendUser.id;

    this.handleSignaling();
    this.handleStart();
    navigator.mediaDevices.ondevicechange = () => {
      this.getDevices();
    };
    await this.getDevices();

    //audioMp3
    //this.playCallSound()
  }


  isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  handleSignaling(){
    this.websocketService.subscribeToTopic(`${BASE_TOPIC_SOCKET}${this.userReceiveId}`).subscribe(async (res:any)=>{
      if (res.binaryBody && res.binaryBody.length > 0) {
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(res.binaryBody);
        const data = JSON.parse(text);


      switch (data.type) {
        case 'offer':
          console.log('handle handleOffer',data);
          this.handleOffer(data);
          break;
        case 'answer':
          console.log('handle handleAnswer',data);
          this.handleAnswer(data);
          break;
        case 'candidate':
          this.handleCandidate(data);
          console.log('handle handleCandidate',data);
          break;
        case 'call':
          if (this.pc) {
            console.log('already in call, ignoring');
            return;
          }
          this.hasCall = true
          break;
        case 'bye':
          if (this.pc) {
            this.hangup();
          }
          break;
        default:
          console.log('unhandled', res);
          break;
      }
      }
    })
  }

  async hangup() {
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    if(this.toStream){
      this.toStream.getTracks().forEach((track:any) => track.stop());
      this.toStream = null;
    }
    this.stopCallSound()
    this.closeModal()
  };


  createPeerConnection() {
    this.pc = new RTCPeerConnection();
    this.pc.onicecandidate = (event :any) => {
      const message: any = {
        userId:this.userSendId,
        type: 'candidate',
        candidate: null,
      };
      if (event.candidate) {
        message.candidate = event.candidate.candidate;
        message.sdpMid = event.candidate.sdpMid;
        message.sdpMLineIndex = event.candidate.sdpMLineIndex;
      }
      //this.signaling.postMessage(message);
      this.websocketService.sendMessage(`${BASE_TOPIC_SOCKET}${this.userSendId}`,message);
    };

    if(this.toStream){
      this.toStream.getTracks().forEach((track:any) => this.pc.addTrack(track, this.toStream));
    }else {
      this.fromStream.getTracks().forEach((track:any) => this.pc.addTrack(track, this.fromStream));
    }
    this.pc.ontrack = (event:any) => {
        this.remoteVideo.nativeElement.srcObject = event.streams[0];
        this.isHideReceiverCall = false
    }

  }

  async makeCall() {

    //set audio và video cho B
    this.toStream = await navigator.mediaDevices.getUserMedia({audio: {
        echoCancellation: true,  // loại bỏ tiếng vang
        noiseSuppression: true,  // giảm tiếng ồn
        autoGainControl: true    // cân bằng âm lượng
      }, video: true});
    this.createPeerConnection();

    const offer = await this.pc.createOffer();
    //this.signaling.postMessage({userId:this.getUserId(),type: 'offer', sdp: offer.sdp});
    this.websocketService.sendMessage(`${BASE_TOPIC_SOCKET}${this.userSendId}`,{userId:this.userSendId,type: 'offer', sdp: offer.sdp})
    await this.pc.setLocalDescription(offer);
  }

  async  handleOffer(offer:any) {
    if (this.pc) {
      console.error('existing peerconnection');
      return;
    }


    this.createPeerConnection();
    await this.pc.setRemoteDescription(offer);
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    //this.signaling.postMessage({userId:this.getUserId(),type: 'answer', sdp: answer.sdp});
    this.websocketService.sendMessage(`${BASE_TOPIC_SOCKET}${this.userSendId}`,{userId:this.userSendId,type: 'answer', sdp: answer.sdp})

  }

  async  handleAnswer(answer:any) {
    if (!this.pc) {
      console.error('no peerconnection');
      return;
    }
    await this.pc.setRemoteDescription(answer);
    //await this.flushPendingCandidates();
  }

  async  handleCandidate(candidate: RTCIceCandidateInit) {
    if (!this.pc) {
      console.error('no peerconnection');
      return;
    }

    // ✅ END-OF-CANDIDATES (candidate = null)
    if (!candidate || !candidate.candidate) {
      try {
        await this.pc.addIceCandidate(null);
      } catch (e) {
        console.error('addIceCandidate(null) error', e);
      }
      return;
    }
    // ICE tới sớm → buffer lại
    // if (!this.pc.remoteDescription) {
    //   console.log('⏳ buffer ICE');
    //   this.pendingCandidates.push(candidate);
    //   return;
    // }
    //SDP đã có → add ICE ngay
    try {
      await this.pc.addIceCandidate(candidate);
    } catch (e) {
      console.error('addIceCandidate error', e);
    }
  }

  // private async flushPendingCandidates() {
  //   for (const candidate of this.pendingCandidates) {
  //     try {
  //       await this.pc.addIceCandidate(candidate);
  //     } catch (e) {
  //       console.error('flush ICE error', e);
  //     }
  //   }
  //   this.pendingCandidates = [];
  // }
  handleAnswerPhone(){
    console.log('handle reply')
    this.receiverCall = false
    this.makeCall();
  }

  async handleStart() {
    this.fromStream = await navigator.mediaDevices.getUserMedia({audio: {
        echoCancellation: true,  // loại bỏ tiếng vang
        noiseSuppression: true,  // giảm tiếng ồn
        autoGainControl: true    // cân bằng âm lượng
      }, video: true});
    this.localVideo.nativeElement.srcObject = this.fromStream;
    console.log('handleStart')
    //this.signaling.postMessage({userId:this.getUserId(),type: 'ready'});
    console.log("call to userID: ", this.userSendId)
    this.websocketService.sendMessage(`${BASE_TOPIC_SOCKET}${this.userSendId}`,{userId:this.userSendId,type: 'call'})
  }

  handleHangup() {
    this.hangup();
    //this.signaling.postMessage({userId:this.getUserId(),type: 'bye'});
    this.websocketService.sendMessage(`${BASE_TOPIC_SOCKET}${this.userSendId}`,{userId:this.userSendId,type: 'bye'})
  }

  getUserSendId(){
    return this.infoCurrentUser.id;
  }

  getUserReceiveId(){
    return this.infoFriendUser.id;
  }

//   =============================handle device info=======================================
  async getDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      this.audioInputs = [];
      this.audioOutputs = [];
      this.videoInputs = [];
      this.hasPermission = false;

      for (const d of devices) {
        if (!d.deviceId) continue;

        this.hasPermission = true;

        if (d.kind === 'audioinput') this.audioInputs.push(d);
        if (d.kind === 'audiooutput') this.audioOutputs.push(d);
        if (d.kind === 'videoinput') this.videoInputs.push(d);
      }

      if (!this.audioOutput && this.audioOutputs.length) {
        this.audioOutput = this.audioOutputs[0].deviceId;
        this.audioOutputCurrent = this.audioOutput;
      }

      if (!this.toStream) return;

      const videoTrack = this.toStream.getVideoTracks()[0];
      const audioTrack = this.toStream.getAudioTracks()[0];

      this.videoInput = videoTrack?.getSettings().deviceId;
      this.audioInput = audioTrack?.getSettings().deviceId;

      this.videoInputCurrent = this.videoInput;
      this.audioInputCurrent = this.audioInput;

      // await this.startAgain();
    } catch (err) {
      console.error('enumerateDevices error', err);
    }
  }

  async startAgain() {
    // Không mở lại device cũ
    if (
      this.hasPermission &&
      this.audioInputCurrent === this.audioInput &&
      this.videoInputCurrent === this.videoInput &&
      this.audioOutputCurrent === this.audioOutput
    ) {
      return;
    }
    this.stopStream();

    const constraints: MediaStreamConstraints = {
      audio: this.audioInput
        ? { deviceId: { exact: this.audioInput } }
        : true,
      video: this.videoInput
        ? { deviceId: { exact: this.videoInput } }
        : true
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      await this.getStream(stream);
    } catch (err) {
      console.error('getUserMedia error', err);
    }
  }

  async getStream(stream: MediaStream) {
    this.stream = stream;
    //xét local
    this.localVideo.nativeElement.srcObject = stream;

    //xét remote
    const newVideoTrack = stream.getVideoTracks()[0];
    try {
      const sender = this.pc
        .getSenders()
        .find((s:any) => s.track?.kind === 'video');
      if (sender) {
        await sender.replaceTrack(newVideoTrack);
      }
    }catch (err) {
      console.error('getSenders error', err);
    }




    // stop track cũ
    this.fromStream?.getVideoTracks()[0]?.stop();
    this.fromStream = stream;


    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];

    this.videoInput = videoTrack?.getSettings().deviceId;
    this.audioInput = audioTrack?.getSettings().deviceId;

    this.videoInputCurrent = this.videoInput;
    this.audioInputCurrent = this.audioInput;
  }

  async changeAudioDestination() {
    const video = this.videoElement.nativeElement;
    if (!('sinkId' in video)) {
      console.warn('Browser does not support setSinkId');
      return;
    }

    try {
      // @ts-ignore
      await video.setSinkId(this.audioOutput);
    } catch (err) {
      console.error('setSinkId error', err);
    }
  }

  stopStream() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = undefined;
      this.videoInputCurrent = undefined;
      this.audioInputCurrent = undefined;
    }
  }

  handleToggleCallCurrent() {
    this.isOpenScreenUserCurrent = !this.isOpenScreenUserCurrent;
  }

  playCallSound() {
    this.audioMp3.loop = true;          // phát liên tục
    this.audioMp3.currentTime = 0;

    this.audioMp3.play().catch(() => {});
    setTimeout(() => {
      this.stopCallSound();
      this.closeModal();
    }, 30000);
  }

  stopCallSound() {
    this.audioMp3.pause();
    this.audioMp3.currentTime = 0;
    this.audioMp3.loop = false;
  }

  handleToggleMicro() {
    if(this.fromStream){
      this.fromStream.getAudioTracks().forEach((track:any) => {
        track.enabled = !track.enabled;
        this.isEnableMic = !this.isEnableMic
      });
    }

    if(this.toStream){
      this.toStream.getAudioTracks().forEach((track:any) => {
        track.enabled = !track.enabled;
        this.isEnableMic = !this.isEnableMic
      });
    }

  }

  handleToggleCamera() {
    if(this.fromStream){
      this.fromStream.getVideoTracks().forEach((track:any) => {
        track.enabled = !track.enabled;
        this.isEnableCamera = !this.isEnableCamera
      });
    }
    if(this.toStream){
      this.toStream.getVideoTracks().forEach((track:any) => {
        track.enabled = !track.enabled;
        this.isEnableCamera = !this.isEnableCamera
      });
    }
  }

  handleShowChangeDevice() {
    this.isShowChangeDevice = !this.isShowChangeDevice
  }

  closeModal(){this.activeModal.close();}

  protected readonly ICON_PHONE = ICON_PHONE;
  protected readonly MICRO_OPEN = MICRO_OPEN;
  protected readonly CAMERA_OPEN = CAMERA_OPEN;
  protected readonly ICON_ARROW_RIGHT = ICON_ARROW_RIGHT;
  protected readonly ICON_ARROW_LEFT = ICON_ARROW_LEFT;
  protected readonly BASE_URL_UPLOAD = BASE_URL_UPLOAD;
  protected readonly MICRO_CLOSE = MICRO_CLOSE;
  protected readonly ICON_THREE_DOT = ICON_THREE_DOT;
  protected readonly CAMERA_CLOSE = CAMERA_CLOSE;
  protected readonly ICON_CALL_AGAIN = ICON_CALL_AGAIN;
}
