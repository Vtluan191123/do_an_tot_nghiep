import {Component, OnInit} from '@angular/core';
import {createLocalVideoTrack, Room, RoomEvent} from "livekit-client";
import {FormsModule} from '@angular/forms';
import {NgForOf} from '@angular/common';
@Component({
  selector: 'app-video-test',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf
  ],
  templateUrl: './video-test.component.html',
  styleUrl: './video-test.component.scss'
})
export class VideoTestComponent implements OnInit{


  async ngOnInit(): Promise<void> {
    if (typeof window === 'undefined') return;
  }
  token:string = ''
  room = new Room();
  cameras: MediaDeviceInfo[] = [];
  micros: MediaDeviceInfo[] = [];
  selectedCamera = "";
  selectedMicro = "";

  async joinRoom(){
    const url = "wss://voicevtluan-9uwd60dy.livekit.cloud";

    if(this.token){
      await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      await this.room.connect(url, this.token);

      this.room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        const element = track.attach();
        document.body.appendChild(element);

        console.log("Received track from:", participant.identity);
      });

      console.log("Connected to room:", this.room);

      console.log('cameras',this.cameras)
      await this.room.localParticipant.setMicrophoneEnabled(true);
      await this.room.localParticipant.setCameraEnabled(true);
      await this.loadCameras()
      await this.loadMicroPhone()




      this.room.remoteParticipants.forEach(participant => {
        participant.trackPublications.forEach(pub => {
          if (pub.track) {
            const el = pub.track.attach();
            document.body.appendChild(el);
          }
        });
      });

      const videoEl = document.getElementById("localVideo") as HTMLVideoElement;
      this.room.localParticipant.videoTrackPublications.forEach(pub => {
        const track = pub.track;
        if (track) {
          track.attach(videoEl);
        }
      });

    }

  }

  async loadCameras() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    this.cameras = devices.filter(d => d.kind === "videoinput");
    if (this.cameras.length) {
      this.selectedCamera = this.cameras[0].deviceId;
    }
  }

  async loadMicroPhone() {
    this.micros = await Room.getLocalDevices('audioinput');
    if (this.micros.length) {
      this.selectedMicro = this.micros[0].deviceId;
    }
  }

  async switchMicro() {
    await this.room.switchActiveDevice('audioinput', this.selectedMicro);
  }

  async switchCamera() {
    await this.room.switchActiveDevice('videoinput', this.selectedCamera);
  }

}
