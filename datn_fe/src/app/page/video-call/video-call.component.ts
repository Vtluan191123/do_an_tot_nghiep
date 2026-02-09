import {Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild} from '@angular/core';
import {WebsocketService} from '../../service/websocket.service';
import {isPlatformBrowser, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    NgForOf
  ],
  templateUrl: './video-call.component.html',
  styleUrl: './video-call.component.scss'
})
export class VideoCallComponent implements OnInit{
  isDisableCall: boolean = false
  isDisableReply: boolean = false
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

  //=====================
  @ViewChild('video', { static: true })
  videoElement!: ElementRef<HTMLVideoElement>;

  audioInputs: MediaDeviceInfo[] = [];
  audioOutputs: MediaDeviceInfo[] = [];
  videoInputs: MediaDeviceInfo[] = [];

  audioInput?: string;
  audioOutput?: string;
  videoInput?: string;

  private stream?: MediaStream;
  private openMic?: string;
  private openCamera?: string;
  hasPermission = false;

  constructor(private websocketService:WebsocketService,@Inject(PLATFORM_ID) private platformId: Object) {
  }

  async ngOnInit(): Promise<void> {
    if(!this.isBrowser()) return
    if (!isPlatformBrowser(this.platformId)) return;
    this.userSendId = this.getUserSendId()
    this.userReceiveId = this.getUserReceiveId()
    this.handleSignaling();

    navigator.mediaDevices.ondevicechange = () => {
      this.getDevices();
    };
    await this.getDevices();
  }

  isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  handleSignaling(){
    this.websocketService.subscribeToTopic(`${this.topic}${this.userReceiveId}`).subscribe(async (res:any)=>{
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
          this.isDisableCall = true
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

    // this.signaling.onmessage = (res:any) =>{
    //
    //     if (!this.localStream) {
    //       console.log('not ready yet');
    //       return;
    //     }
    //
    //     switch (res.data.type) {
    //       case 'offer':
    //         console.log('handle handleOffer',res.data);
    //         this.handleOffer(res.data);
    //         break;
    //       case 'answer':
    //         console.log('handle handleAnswer',res.data);
    //         this.handleAnswer(res.data);
    //         break;
    //       case 'candidate':
    //         this.handleCandidate(res.data);
    //         console.log('handle handleCandidate',res.data);
    //         break;
    //       case 'ready':
    //         if (this.pc) {
    //           console.log('already in call, ignoring');
    //           return;
    //         }
    //         console.log('handle makeCall');
    //         this.makeCall();
    //         break;
    //       case 'bye':
    //         if (this.pc) {
    //           this.hangup();
    //         }
    //         break;
    //       default:
    //         console.log('unhandled', res);
    //         break;
    //   }
    // }
  }

  async hangup() {
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    this.toStream.getTracks().forEach((track:any) => track.stop());
    this.toStream = null;
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
      this.websocketService.sendMessage(`${this.topic}${this.userSendId}`,message);
    };
    this.pc.ontrack = (event:any) => {
      if(this.toStream){
        this.remoteVideo.nativeElement.srcObject = event.streams[0];
        this.remoteVideo.nativeElement.srcObject = event.streams[0];
      }else {
        this.localVideo.nativeElement.srcObject = event.streams[0];
        this.remoteVideo.nativeElement.srcObject = event.streams[0];
      }

    }
    if(this.toStream){
      this.toStream.getTracks().forEach((track:any) => this.pc.addTrack(track, this.toStream));
    }else {
      this.fromStream.getTracks().forEach((track:any) => this.pc.addTrack(track, this.fromStream));
    }

  }

  async makeCall() {

    //set audio và video cho B
    this.toStream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
    this.localVideo.nativeElement.srcObject = this.toStream;
    this.createPeerConnection();

    const offer = await this.pc.createOffer();
    //this.signaling.postMessage({userId:this.getUserId(),type: 'offer', sdp: offer.sdp});
    this.websocketService.sendMessage(`${this.topic}${this.userSendId}`,{userId:this.userSendId,type: 'offer', sdp: offer.sdp})
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
    this.websocketService.sendMessage(`${this.topic}${this.userSendId}`,{userId:this.userSendId,type: 'answer', sdp: answer.sdp})

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
    this.isDisableReply = true
    this.makeCall();
  }

  async handleStart() {
    this.fromStream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
    this.localVideo.nativeElement.srcObject = this.fromStream;
    console.log('handleStart')
    //this.signaling.postMessage({userId:this.getUserId(),type: 'ready'});
    console.log("call to userID: ", this.userSendId)
    this.isDisableCall = true
    this.websocketService.sendMessage(`${this.topic}${this.userSendId}`,{userId:this.userSendId,type: 'call'})
  }

  handleHangup() {
    this.hangup();
    //this.signaling.postMessage({userId:this.getUserId(),type: 'bye'});
    //this.websocketService.sendMessage(`${this.topic}${this.userSendId}`,{userId:this.userSendId,type: 'bye'})
  }

  getUserSendId(){
    const userId = localStorage.getItem('userSendId')
    return userId;
  }

  getUserReceiveId(){
    const userId = localStorage.getItem('userReceiveId')
    return userId;
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

      this.start();
    } catch (err) {
      console.error('enumerateDevices error', err);
    }
  }

  async start() {
    // Không mở lại device cũ
    if (
      this.hasPermission &&
      this.openMic === this.audioInput &&
      this.openCamera === this.videoInput
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
      this.gotStream(stream);
    } catch (err) {
      console.error('getUserMedia error', err);
    }
  }

  async gotStream(stream: MediaStream) {
    this.stream = stream;
    //xét local
    this.localVideo.nativeElement.srcObject = stream;

    //xét remote
    const newVideoTrack = stream.getVideoTracks()[0];
    const sender = this.pc
      .getSenders()
      .find((s:any) => s.track?.kind === 'video');

    if (sender) {
      await sender.replaceTrack(newVideoTrack);
    }

    // stop track cũ
    this.fromStream?.getVideoTracks()[0]?.stop();
    this.fromStream = stream;


    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];

    this.openCamera = videoTrack?.getSettings().deviceId;
    this.openMic = audioTrack?.getSettings().deviceId;
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
      this.openCamera = undefined;
      this.openMic = undefined;
    }
  }
}
