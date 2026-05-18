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


  audioInputs: MediaDeviceInfo[] = [];
  audioOutputs: MediaDeviceInfo[] = [];
  videoInputs: MediaDeviceInfo[] = [];

  //status
  receiverCall:any
  isHideReceiverCall:boolean = true
  metadataCall:any
  isInitiator: boolean = false  // true = người gọi (A), false = người nhận (B)
  pendingOffer: any = null  // Lưu offer chờ user accept

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

    // Delay thêm 100ms để cho phép metadataCall được set từ parent component
    setTimeout(async () => {
      await this.init();
    }, 100);
  }

  async init(){
    this.infoCurrentUser = await getInfoCurrentUser(
      this.authService.getInfoUser()
    );

      // lấy khi mở message detail
    this.transferDataService.userDetailGroud$.subscribe(user => {
      if (!user) return;
      console.log('Got infoFriendUser from transferData:', user);
      this.infoFriendUser = user;
    });

    // Nếu không có infoFriendUser từ transferData, lấy từ metadataCall (khi nhận call)
    if(!this.infoFriendUser && this.metadataCall && this.metadataCall.infoCaller){
      console.log('Got infoFriendUser from metadataCall:', this.metadataCall.infoCaller);
      this.infoFriendUser = this.metadataCall.infoCaller;
      this.receiverCall = true; // Đây là người nhận call
      this.isInitiator = false;
    } else if (!this.infoFriendUser) {
      // Nếu vẫn không có infoFriendUser từ cả 2 nguồn, có lỗi
      console.error('No friend info available. metadataCall:', this.metadataCall);
      return;
    } else {
      // Có infoFriendUser từ transferData = người gọi
      this.isInitiator = true;
      console.log('Initiator - Friend info:', this.infoFriendUser);
    }

    this.userSendId = this.infoCurrentUser.id;
    this.userReceiveId = this.infoFriendUser.id;
    console.log('Setup complete. isInitiator:', this.isInitiator, 'userSendId:', this.userSendId, 'userReceiveId:', this.userReceiveId);

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
          // Initiator (người gọi) không cần nhận 'call' message của chính mình
          if (this.isInitiator) {
            console.log('Initiator ignoring own call message');
            return;
          }
          if (this.pc) {
            console.log('already in call, ignoring');
            return;
          }
          // Lưu thông tin người gọi từ metadata
          if (data.callerInfo) {
            console.log('Receiver got call from:', data.callerInfo);
            this.infoFriendUser = data.callerInfo;
          }
          this.hasCall = true;
          this.receiverCall = true; // Đây là người nhận call
          this.isHideReceiverCall = true; // Hiển thị UI trạng thái nhận call
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
    // Close and cleanup peer connection
    if (this.pc) {
      try {
        this.pc.onicecandidate = null;
        this.pc.ontrack = null;
        this.pc.getSenders().forEach((sender: any) => {
          try { sender.replaceTrack(null); } catch (e) {}
        });
        this.pc.close();
      } catch (e) {}
      this.pc = null;
    }
    // Stop and cleanup all streams
    if (this.toStream) {
      this.toStream.getTracks().forEach((track: any) => track.stop());
      this.toStream = null;
    }
    if (this.fromStream) {
      this.fromStream.getTracks().forEach((track: any) => track.stop());
      this.fromStream = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track: any) => track.stop());
      this.stream = undefined;
    }
    // Clear video elements
    if (this.localVideo && this.localVideo.nativeElement) {
      this.localVideo.nativeElement.srcObject = null;
    }
    if (this.remoteVideo && this.remoteVideo.nativeElement) {
      this.remoteVideo.nativeElement.srcObject = null;
    }
    // Reset device info
    this.audioInputCurrent = undefined;
    this.videoInputCurrent = undefined;
    this.audioOutputCurrent = undefined;
    // Reset UI state
    this.receiverCall = undefined;
    this.isHideReceiverCall = true;
    this.hasCall = false;
    this.stopCallSound();
    this.closeModal();
    window.location.reload();
  }


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

    // Thêm tracks từ stream hiện tại
    const activeStream = this.toStream || this.fromStream;
    if(activeStream){
      activeStream.getTracks().forEach((track:any) => this.pc.addTrack(track, activeStream));
    }

    this.pc.ontrack = (event:any) => {
        console.log('ontrack received', event.streams);
        this.remoteVideo.nativeElement.srcObject = event.streams[0];
    }

  }

  async makeCall() {
    // Always reset peer connection before making a new call
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }

    // Người gọi sử dụng fromStream (đã tạo ở handleStart)
    // Người nhận sẽ tạo toStream riêng ở handleOffer

    this.createPeerConnection();

    const offer = await this.pc.createOffer();

    // Wrap offer vào RTCSessionDescription
    const offerDescription = new RTCSessionDescription({
      type: 'offer' as RTCSdpType,
      sdp: offer.sdp
    });

    console.log('Sending offer to user:', this.userSendId);
    this.websocketService.sendMessage(`${BASE_TOPIC_SOCKET}${this.userSendId}`,{
      userId:this.userSendId,
      type: 'offer',
      sdp: offer.sdp
    })
    await this.pc.setLocalDescription(offerDescription);
  }

  async  handleOffer(offer:any) {
    console.log('Handling offer from user:', offer.userId);

    // Lưu offer, chờ user accept
    this.pendingOffer = offer;

    // Reset peer connection trước khi tạo mới
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }

    // Tạo PC nhưng chưa gửi answer
    this.createPeerConnection();

    // Wrap offer vào RTCSessionDescription
    const offerDescription = new RTCSessionDescription({
      type: 'offer' as RTCSdpType,
      sdp: offer.sdp
    });

    await this.pc.setRemoteDescription(offerDescription);

    console.log('Receiver: offer saved, waiting for user to accept');
  }

  async  handleAnswer(answer:any) {
    if (!this.pc) {
      console.error('no peerconnection');
      return;
    }

    // Wrap answer vào RTCSessionDescription
    const answerDescription = new RTCSessionDescription({
      type: 'answer' as RTCSdpType,
      sdp: answer.sdp
    });

    await this.pc.setRemoteDescription(answerDescription);
    //await this.flushPendingCandidates();
  }

  async  handleCandidate(candidate: any) {
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
      const iceCandidate = new RTCIceCandidate({
        candidate: candidate.candidate,
        sdpMLineIndex: candidate.sdpMLineIndex,
        sdpMid: candidate.sdpMid
      });
      await this.pc.addIceCandidate(iceCandidate);
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
  async handleAnswerPhone(){
    console.log('handle reply - user accepting incoming call');
    this.receiverCall = false;
    this.isHideReceiverCall = false;  // Ẩn incoming call UI ngay

    // Tạo toStream (local stream của người nhận)
    if (!this.toStream) {
      this.toStream = await navigator.mediaDevices.getUserMedia({audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }, video: true});

      // Cập nhật device info
      await this.getDevices();

      // Hiển thị video của người nhận
      if (this.localVideo && this.localVideo.nativeElement) {
        this.localVideo.nativeElement.srcObject = this.toStream;
      }
    }

    // Nếu đã có pendingOffer, giờ tạo answer và gửi
    if (this.pendingOffer && this.pc) {
      const answer = await this.pc.createAnswer();

      // Wrap answer vào RTCSessionDescription
      const answerDescription = new RTCSessionDescription({
        type: 'answer' as RTCSdpType,
        sdp: answer.sdp
      });

      await this.pc.setLocalDescription(answerDescription);

      console.log('Sending answer to user:', this.userSendId);
      this.websocketService.sendMessage(`${BASE_TOPIC_SOCKET}${this.userSendId}`,{
        userId:this.userSendId,
        type: 'answer',
        sdp: answer.sdp
      });

      this.pendingOffer = null; // Clear pending offer
    }
  }

  async handleStart() {
    // Tạo fromStream cho người gọi
    this.fromStream = await navigator.mediaDevices.getUserMedia({audio: {
        echoCancellation: true,  // loại bỏ tiếng vang
        noiseSuppression: true,  // giảm tiếng ồn
        autoGainControl: true    // cân bằng âm lượng
      }, video: true});
    this.localVideo.nativeElement.srcObject = this.fromStream;
    console.log('handleStart - created local stream');

    // Chỉ người gọi (initiator) mới thực hiện bước gửi call message
    if (this.isInitiator) {
      console.log("Initiator: sending call to userID: ", this.userSendId);
      // Gửi thông tin người gọi kèm theo message call
      this.websocketService.sendMessage(`${BASE_TOPIC_SOCKET}${this.userSendId}`,{
        userId: this.userSendId,
        type: 'call',
        callerInfo: this.infoCurrentUser // Gửi thông tin người gọi
      });

      // Người gọi gửi offer
      this.makeCall();
    } else {
      console.log("Receiver: waiting for offer from caller");
    }
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

      // Lấy device từ stream hiện có (ưu tiên toStream, nếu không có thì fromStream)
      const activeStream = this.toStream || this.fromStream;
      if (!activeStream) return;

      const videoTrack = activeStream.getVideoTracks()[0];
      const audioTrack = activeStream.getAudioTracks()[0];

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
    // Local video
    if (this.localVideo && this.localVideo.nativeElement) {
      this.localVideo.nativeElement.srcObject = stream;
    }

    // Replace video track on peer connection if exists
    if (this.pc) {
      const newVideoTrack = stream.getVideoTracks()[0];
      try {
        const sender = this.pc.getSenders().find((s: any) => s.track?.kind === 'video');
        if (sender && newVideoTrack) {
          await sender.replaceTrack(newVideoTrack);
        }
      } catch (err) {
        console.error('replaceTrack error', err);
      }
    }

    // Stop old track
    this.fromStream?.getVideoTracks()[0]?.stop();
    this.fromStream = stream;

    // Update device info
    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];
    this.videoInput = videoTrack?.getSettings().deviceId;
    this.audioInput = audioTrack?.getSettings().deviceId;
    this.videoInputCurrent = this.videoInput;
    this.audioInputCurrent = this.audioInput;
  }

  async changeAudioDestination() {
    const video = this.remoteVideo.nativeElement;
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
    const isNowEnabled = !this.isEnableMic;

    if(this.fromStream){
      this.fromStream.getAudioTracks().forEach((track:any) => {
        track.enabled = isNowEnabled;
      });
    }

    if(this.toStream){
      this.toStream.getAudioTracks().forEach((track:any) => {
        track.enabled = isNowEnabled;
      });
    }

    this.isEnableMic = isNowEnabled;
  }

  handleToggleCamera() {
    const isNowEnabled = !this.isEnableCamera;

    if(this.fromStream){
      this.fromStream.getVideoTracks().forEach((track:any) => {
        track.enabled = isNowEnabled;
      });
    }
    if(this.toStream){
      this.toStream.getVideoTracks().forEach((track:any) => {
        track.enabled = isNowEnabled;
      });
    }

    this.isEnableCamera = isNowEnabled;
  }

  handleShowChangeDevice() {
    this.isShowChangeDevice = !this.isShowChangeDevice
  }

  closeModal(){this.activeModal.close();}

  resetAll() {
    this.hangup();
    this.isShowChangeDevice = false;
    this.isEnableMic = true;
    this.isEnableCamera = true;
    this.isOpenScreenUserCurrent = true;
    // Reset thêm biến nếu cần
    setTimeout(() => {
      this.init();
    }, 100);
  }

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

  getAvatar(): string {
    if (this.infoFriendUser?.email) {
      const email = this.infoFriendUser.email.toLowerCase().trim();
      const hash = this.simpleHash(email);
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.infoFriendUser.username)}&background=${hash.substring(0, 6)}&color=fff`;
    }
    return 'https://ui-avatars.com/api/?name=User&background=667eea&color=fff';
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
}
