import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoConferenceClientComponent } from './video-conference-client.component';

describe('VideoConferenceClientComponent', () => {
  let component: VideoConferenceClientComponent;
  let fixture: ComponentFixture<VideoConferenceClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoConferenceClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoConferenceClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
