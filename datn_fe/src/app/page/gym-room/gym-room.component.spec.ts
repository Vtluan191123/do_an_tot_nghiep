import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GymRoomComponent } from './gym-room.component';

describe('GymRoomComponent', () => {
  let component: GymRoomComponent;
  let fixture: ComponentFixture<GymRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GymRoomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GymRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

