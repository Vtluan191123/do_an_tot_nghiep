import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmoteModalComponent } from './emote-modal.component';

describe('EmoteModalComponent', () => {
  let component: EmoteModalComponent;
  let fixture: ComponentFixture<EmoteModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmoteModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmoteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
