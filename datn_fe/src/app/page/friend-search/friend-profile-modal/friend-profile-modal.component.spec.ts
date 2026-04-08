import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FriendProfileModalComponent } from './friend-profile-modal.component';

describe('FriendProfileModalComponent', () => {
  let component: FriendProfileModalComponent;
  let fixture: ComponentFixture<FriendProfileModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendProfileModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FriendProfileModalComponent);
    component = fixture.componentInstance;
    component.friend = {
      id: '1',
      name: 'Test User',
      username: 'testuser',
      avatar: 'test.jpg',
      isOnline: true
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit close event', () => {
    spyOn(component.close, 'emit');
    component.onClose();
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should emit addFriend event', () => {
    spyOn(component.addFriend, 'emit');
    component.onAddFriend();
    expect(component.addFriend.emit).toHaveBeenCalledWith('1');
  });
});

